import {handleUpload,type HandleUploadBody} from "@vercel/blob/client";
import {z} from "zod";
import {requireWorkspaceUser} from "@/lib/session";
import {fail,writeCheck} from "@/lib/server";
export const runtime="nodejs";
export async function POST(request:Request){try{
 const user=await requireWorkspaceUser();writeCheck(request);
 const body=await request.json() as HandleUploadBody;
 // No webhook persistence: the authenticated finalize endpoint writes the record.
 if(body.type!=="blob.generate-client-token")return Response.json({error:"Geçersiz yükleme isteği."},{status:400});
 const result=await handleUpload({request,body,onBeforeGenerateToken:async pathname=>{
  const prefix=`files/${user.userId}/`;
  if(!pathname.startsWith(prefix)||!z.string().uuid().safeParse(pathname.slice(prefix.length)).success)throw new Error("Geçersiz dosya yolu.");
  return {maximumSizeInBytes:10*1024*1024,validUntil:Date.now()+10*60*1000,addRandomSuffix:false,allowOverwrite:false};
 }});
 return Response.json(result);
}catch(error){return fail(error);}}
