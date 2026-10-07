import {requireWorkspaceUser} from "@/lib/session";
import {del} from "@vercel/blob";
import {z} from "zod";
import {allEntries,db,entryInput,fail,writeCheck} from "@/lib/server";
export async function GET(){try{await requireWorkspaceUser();return Response.json({entries:await allEntries()},{headers:{"Cache-Control":"no-store"}});}catch(e){return fail(e);}}
export async function POST(req:Request){try{await requireWorkspaceUser();writeCheck(req);const v=entryInput.parse(await req.json());if(v.kind==="files")return Response.json({error:"Dosyayı yükle düğmesini kullan."},{status:400});const id=crypto.randomUUID(),created=new Date().toISOString();await db().prepare("INSERT INTO entries (id,kind,title,body,status,date,url,amount,priority,created) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(id,v.kind,v.title,v.body,v.status,v.date,v.url,v.amount,v.priority,created).run();return Response.json({entry:{id,...v,created}},{status:201});}catch(e){return fail(e);}}
export async function PATCH(req:Request){try{await requireWorkspaceUser();writeCheck(req);const p=z.object({id:z.string()}).passthrough().parse(await req.json());if(typeof p.id!=="string")return Response.json({error:"Kayıt bulunamadı."},{status:400});const old=await db().prepare("SELECT * FROM entries WHERE id=?").bind(p.id).first();if(!old)return Response.json({error:"Kayıt bulunamadı."},{status:404});const v=entryInput.parse({...old,...p});await db().prepare("UPDATE entries SET title=?,body=?,status=?,date=?,url=?,amount=?,priority=? WHERE id=?").bind(v.title,v.body,v.status,v.date,v.url,v.amount,v.priority,p.id).run();return Response.json({entry:{...old,...v}});}catch(e){return fail(e);}}
export async function DELETE(req:Request){try{
 await requireWorkspaceUser();writeCheck(req);
 const {id}=z.object({id:z.string().min(1).max(200)}).parse(await req.json());
 const old=await db().prepare("SELECT * FROM entries WHERE id=?").bind(id).first();
 if(!old)return Response.json({ok:true,deletedId:id,alreadyDeleted:true});
 if(old.kind==="files")await del(String(old.body));
 await db().prepare("DELETE FROM entries WHERE id=?").bind(id).run();
 const remaining=await db().prepare("SELECT id FROM entries WHERE id=?").bind(id).first();
 if(remaining)throw new Error("Silme işlemi doğrulanamadı.");
 return Response.json({ok:true,deletedId:id,alreadyDeleted:false});
}catch(e){return fail(e);}}
