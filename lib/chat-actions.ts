import type {Entry,Kind} from "./dashhan";
export type DeletionTarget=Pick<Entry,"id"|"title"|"kind">;
const normalize=(value:string)=>value.trim().toLocaleLowerCase("tr-TR").replace(/[.!?…]+$/g,"").replace(/\s+/g," ");
export const isDeletionConfirmation=(value:string)=>new Set(["onayla","onaylıyorum","onay","evet","evet sil","evet onayla","tamam","tamam sil","sil","silebilirsin","sil lütfen","onayla lütfen"]).has(normalize(value));
export const isDeletionCancellation=(value:string)=>new Set(["hayır","vazgeç","vazgeçtim","iptal","iptal et","silme"]).has(normalize(value));
type ModelReply={reply:string;focus:Kind|"core";proposal:unknown;deletionId:string|null};
export function prepareChatReply<T extends ModelReply>(output:T,entries:Entry[]){
 if(output.deletionId){
  const target=entries.find(entry=>entry.id===output.deletionId);
  if(!target)return {...output,proposal:null,deletion:null,reply:"Silinecek kayıt bulunamadı. Silmek istediğin kaydın adını belirt."};
  const deletion:DeletionTarget={id:target.id,title:target.title,kind:target.kind};
  return {...output,focus:target.kind,proposal:null,deletion,reply:`“${target.title}” kaydını silmek için onayını bekliyorum. “Onayla” yazabilir veya aşağıdaki düğmeyi kullanabilirsin.`};
 }
 const unsupportedClaim=/sildim|sildik|silindi|silinmiştir|kaldırdım|kaldırıldı|temizledim|iptal ettim|silinmek üzere/i.test(output.reply.toLocaleLowerCase("tr-TR"));
 return {...output,deletion:null,reply:unsupportedClaim?"Herhangi bir kayıt silmedim. Silmek istediğin kaydın adını belirt.":output.reply};
}
