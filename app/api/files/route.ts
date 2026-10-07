import {z} from "zod";
import {get,head} from "@vercel/blob";
import {db,fail,writeCheck} from "@/lib/server";
import {requireWorkspaceUser} from "@/lib/session";
export const runtime="nodejs";
export async function POST(request:Request){try{
 const user=await requireWorkspaceUser();writeCheck(request);
 const value=z.object({pathname:z.string().max(300),title:z.string().trim().min(1).max(200)}).strict().parse(await request.json());
 const prefix=`files/${user.userId}/`,id=value.pathname.slice(prefix.length);
 if(!value.pathname.startsWith(prefix)||!z.string().uuid().safeParse(id).success)return Response.json({error:"Dosya yolu geçerli değil."},{status:400});
 const blob=await head(value.pathname);
 if(blob.pathname!==value.pathname||!new URL(blob.url).hostname.endsWith(".private.blob.vercel-storage.com")||!blob.size||blob.size>10*1024*1024)return Response.json({error:"Dosya geçerli değil."},{status:400});
 await db().prepare("INSERT INTO entries (id,kind,title,body,status,date,url,amount,priority,created) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING").bind(id,"files",value.title,value.pathname,0,"","",blob.size,"normal",new Date().toISOString()).run();
 return Response.json({ok:true,id});
}catch(error){return fail(error);}}
export async function GET(request:Request){try{
 await requireWorkspaceUser();
 const id=new URL(request.url).searchParams.get("id");
 const row=await db().prepare("SELECT title,body FROM entries WHERE id=? AND kind='files'").bind(id).first();
 if(!row)return new Response("Dosya bulunamadı",{status:404});
 const file=await get(String(row.body),{access:"private",useCache:false});
 if(!file||file.statusCode!==200)return new Response("Dosya bulunamadı",{status:404});
 return new Response(file.stream,{headers:{"Content-Type":"application/octet-stream","Content-Disposition":"attachment; filename*=UTF-8''"+encodeURIComponent(String(row.title)),"X-Content-Type-Options":"nosniff","Cache-Control":"private, no-store"}});
}catch(error){return fail(error);}}
