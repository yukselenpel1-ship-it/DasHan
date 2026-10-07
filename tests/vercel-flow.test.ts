import {test} from "node:test";
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {createServer} from "node:net";
import {randomBytes} from "node:crypto";
import {PGlite} from "@electric-sql/pglite";
import {PGLiteSocketServer} from "@electric-sql/pglite-socket";

test("Vercel HTTP flow: owner signup, sessions, CRUD, encrypted notes and logout",{timeout:120000},async context=>{
 const database=await PGlite.create();
 const socket=new PGLiteSocketServer({db:database,host:"127.0.0.1",port:0,maxConnections:8});
 await socket.start();
 const freePort=createServer();await new Promise<void>(resolve=>freePort.listen(0,"127.0.0.1",resolve));
 const port=(freePort.address() as {port:number}).port;await new Promise<void>(resolve=>freePort.close(()=>resolve()));
 const origin=`http://127.0.0.1:${port}`,email="owner@example.test",password=randomBytes(18).toString("base64url"),setup=randomBytes(32).toString("base64url");
 process.env.DATABASE_URL=`postgresql://postgres:postgres@${socket.getServerConn()}/postgres`;process.env.BETTER_AUTH_SECRET=randomBytes(32).toString("base64url");process.env.BETTER_AUTH_URL=origin;process.env.DASHHAN_OWNER_EMAIL=email;process.env.DASHHAN_SETUP_CODE=setup;
 const {getPool}=await import("../lib/database");
 context.after(async()=>{await getPool().end();await socket.stop();await new Promise(resolve=>setTimeout(resolve,250));await database.close();});
 async function migrate(){
  const child=spawn(process.execPath,["--import","tsx","scripts/migrate.ts"],{env:process.env,stdio:["ignore","pipe","pipe"]});
  let output="";child.stdout.on("data",value=>{output+=String(value)});child.stderr.on("data",value=>{output+=String(value)});
  const code=await new Promise<number|null>((resolve,reject)=>{child.on("error",reject);child.on("exit",resolve);});
  assert.equal(code,0,output);
 }
 await migrate();await migrate(); // Production migrations must be repeatable.
 const server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","--hostname","127.0.0.1","--port",String(port)],{env:{...process.env,NODE_ENV:"production",NEXT_TELEMETRY_DISABLED:"1"},stdio:["ignore","pipe","pipe"]});
 let logs="";server.stdout.on("data",value=>{logs+=String(value)});server.stderr.on("data",value=>{logs+=String(value)});
 let cookie="";
 async function request(path:string,method="GET",body?:unknown,extra:Record<string,string>={}){
  const response=await fetch(origin+path,{method,headers:{origin,...(cookie?{cookie}:{}),...(body?{"Content-Type":"application/json"}:{}),...extra},body:body?JSON.stringify(body):undefined});
  const setCookies=response.headers.getSetCookie();if(setCookies.length)cookie=setCookies.map(value=>value.split(";")[0]).join("; ");
  return response;
 }
 try{
  for(let attempt=0;attempt<100;attempt++){
   try{if((await fetch(origin+"/api/auth/ok")).ok)break;}catch{}
   if(attempt===99)throw new Error("Next server did not become ready: "+logs.slice(-1200));
   await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert.equal((await request("/api/entries")).status,401);
  assert.match(await (await request("/")).text(),/KİŞİSEL KONTROL MERKEZİ/);
  assert.equal((await request("/api/entries","POST",{title:"blocked",kind:"notes"},{"oai-authenticated-user-id":"spoofed","oai-authenticated-user-email":email})).status,401);
  assert.equal((await request("/api/ai","POST",{message:"sil"})).status,401);
  assert.equal((await request("/api/private-area")).status,401);
  assert.equal((await request("/api/files?id=unknown")).status,401);
  assert.equal((await request("/api/files/upload","POST",{type:"blob.generate-client-token"})).status,401);
  const signup={name:"Test Owner",email,password};
  assert.equal((await request("/api/auth/sign-up/email","POST",{...signup,email:"other@example.test"},{"x-dashhan-setup-code":setup})).status,403);
  assert.equal((await request("/api/auth/sign-up/email","POST",signup,{"x-dashhan-setup-code":"invalid"})).status,403);
  const signupResponse=await request("/api/auth/sign-up/email","POST",signup,{"x-dashhan-setup-code":setup});
  assert.equal(signupResponse.status,200,await signupResponse.text());assert.ok(cookie);
  const session=await (await request("/api/auth/get-session")).json();assert.equal(session.user.email,email);
  const title="'; DROP TABLE entries; --";
  const created=await request("/api/entries","POST",{kind:"calendar",title,date:"2026-10-08T12:00:00Z"});assert.equal(created.status,201,logs.slice(-2000));
  const entry=(await created.json()).entry;
  assert.equal((await request("/api/entries","PATCH",{id:entry.id,title:"Updated plan"})).status,200);
  assert.equal((await request("/api/entries","POST",{kind:"notes",title:"Cross-site"},{origin:"https://attacker.example"})).status,403);
  const {createSalt,deriveNoteKey,sealNote,openNote}=await import("../lib/private-area");
  const salt=createSalt(),noteKey=await deriveNoteKey("Private note test password",salt),plain="Only my password can open this note.";
  const sealed=await sealNote(plain,noteKey,salt);
  const first=await request("/api/private-area","PUT",{...sealed,revision:0});assert.equal(first.status,201);
  const stored=(await first.json()).note;assert.equal(await openNote(stored,noteKey),plain);
  assert.equal((await request("/api/private-area","PUT",{...sealed,revision:0})).status,409);
  const updatedNote=await sealNote("Updated private note",noteKey,salt);
  assert.equal((await request("/api/private-area","PUT",{...updatedNote,revision:1})).status,200);
  const currentNote=(await (await request("/api/private-area")).json()).note;
  assert.equal(currentNote.revision,2);assert.equal(await openNote(currentNote,noteKey),"Updated private note");
  assert.equal((await request("/api/private-area","PUT",{...sealed,revision:1})).status,409);
  assert.equal((await request("/api/private-area","PUT",{...sealed,revision:1},{origin:"https://attacker.example"})).status,403);
  assert.equal((await database.query<{ciphertext:string}>("SELECT ciphertext FROM private_notes")).rows[0].ciphertext.includes(plain),false);
  const before=await (await request("/api/entries")).json();assert.equal(before.entries.length,1);assert.equal(before.entries[0].title,"Updated plan");
  const deleted=await request("/api/entries","DELETE",{id:entry.id});assert.equal((await deleted.json()).deletedId,entry.id);
  assert.equal((await (await request("/api/entries","DELETE",{id:entry.id})).json()).alreadyDeleted,true);
  assert.equal((await (await request("/api/entries")).json()).entries.length,0);
  assert.equal((await request("/api/files","POST",{pathname:"files/another-owner/7cddc322-dd34-46d5-9ff0-58c33dbfd840",title:"blocked"})).status,400);
  const revokedCookie=cookie;assert.equal((await request("/api/auth/sign-out","POST",{})).status,200);cookie="";
  assert.equal((await request("/api/entries","GET",undefined,{cookie:revokedCookie})).status,401);
  assert.equal((await request("/api/entries")).status,401);
  assert.equal((await request("/api/auth/sign-in/email","POST",{email,password:"wrong password"})).status,401);
  assert.equal((await request("/api/auth/sign-in/email","POST",{email,password})).status,200);
  assert.equal((await request("/api/entries")).status,200);
 }finally{
  server.kill("SIGTERM");await new Promise<void>(resolve=>server.once("exit",()=>resolve()));

 }
});
