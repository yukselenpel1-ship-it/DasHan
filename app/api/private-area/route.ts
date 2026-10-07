import {z} from "zod";
import {getChatGPTUser} from "@/app/chatgpt-auth";
import {db} from "@/lib/server";

const payload=z.object({version:z.literal(1),salt:z.string().regex(/^[A-Za-z0-9+/]{22}==$/),iv:z.string().regex(/^[A-Za-z0-9+/]{16}$/),ciphertext:z.string().min(24).max(550000).regex(/^[A-Za-z0-9+/]+={0,2}$/),revision:z.number().int().min(0)}).strict();
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store"}});
export async function GET(){
 try{
  const user=await getChatGPTUser();if(!user)return reply({error:"Özel alan için hesabınla giriş yap."},401);
  const note=await db().prepare("SELECT version,salt,iv,ciphertext,revision,updated FROM private_notes WHERE user_id=?").bind(user.userId).first();
  return reply({note});
 }catch{return reply({error:"Özel alan yüklenemedi. Yeniden dene."},503);}
}
export async function PUT(request:Request){
 try{
  const user=await getChatGPTUser();if(!user)return reply({error:"Özel alan için hesabınla giriş yap."},401);
  if(request.headers.get("origin")!==new URL(request.url).origin)return reply({error:"Bu istek kabul edilmedi."},403);
  if(Number(request.headers.get("content-length"))>560000)return reply({error:"Notun çok uzun."},413);
  const raw=await request.text();if(raw.length>560000)return reply({error:"Notun çok uzun."},413);
  const value=payload.parse(JSON.parse(raw));
  const updated=new Date().toISOString(),revision=value.revision+1;
  const result=value.revision===0
   ?await db().prepare("INSERT INTO private_notes (user_id,version,salt,iv,ciphertext,revision,updated) VALUES (?,?,?,?,?,1,?) ON CONFLICT(user_id) DO NOTHING").bind(user.userId,value.version,value.salt,value.iv,value.ciphertext,updated).run()
   :await db().prepare("UPDATE private_notes SET iv=?,ciphertext=?,revision=?,updated=? WHERE user_id=? AND revision=? AND salt=? AND version=?").bind(value.iv,value.ciphertext,revision,updated,user.userId,value.revision,value.salt,value.version).run();
  if(!result.meta.changes)return reply({error:"Özel alan başka bir pencerede değişti. Notunu kopyalayıp pencereyi yeniden aç."},409);
  return reply({note:{version:value.version,salt:value.salt,iv:value.iv,ciphertext:value.ciphertext,revision,updated}},value.revision===0?201:200);
 }catch(error){return reply({error:error instanceof z.ZodError||error instanceof SyntaxError?"Not verisi geçerli değil.":"Not kaydedilemedi. Yeniden dene."},error instanceof z.ZodError||error instanceof SyntaxError?400:503);}
}
