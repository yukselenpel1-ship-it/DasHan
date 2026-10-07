import { env } from "cloudflare:workers";
import { z } from "zod";
export function db():D1Database {if(!env.DB)throw new Error("Kayıtlarına şu anda ulaşılamıyor.");return env.DB;}
export function bucket():R2Bucket {if(!env.BUCKET)throw new Error("Dosyalarına şu anda ulaşılamıyor.");return env.BUCKET;}
export const entryInput=z.object({kind:z.enum(["projects","tasks","calendar","notes","files","finance","links"]),title:z.string().trim().min(1).max(200),body:z.string().max(12000).default(""),status:z.number().int().min(0).max(1).default(0),date:z.string().max(40).default(""),url:z.string().max(2000).default(""),amount:z.number().finite().default(0),priority:z.enum(["normal","high"]).default("normal")}).superRefine((v,c)=>{if(v.url&&!/^https?:\/\//i.test(v.url))c.addIssue({code:"custom",message:"Geçerli bir https:// bağlantısı gir.",path:["url"]});if(v.date&&Number.isNaN(Date.parse(v.date)))c.addIssue({code:"custom",message:"Geçerli bir tarih gir.",path:["date"]});});
export function writeCheck(req:Request){const origin=req.headers.get("origin");if(origin&&origin!==new URL(req.url).origin)throw new Error("Bu istek kabul edilmedi.");}
export function fail(error:unknown){return Response.json({error:error instanceof z.ZodError?error.issues[0].message:"İşlem tamamlanamadı. Lütfen yeniden dene."},{status:error instanceof z.ZodError?400:503});}
export async function allEntries(){return(await db().prepare("SELECT * FROM entries ORDER BY created DESC LIMIT 500").all()).results;}
