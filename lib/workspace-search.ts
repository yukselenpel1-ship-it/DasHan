import {modules,type Entry} from "./dashhan";

const normalize=(value:string)=>value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/\p{M}/gu,"").replace(/ı/g,"i");
export function searchEntries(entries:Entry[],query:string){
 const terms=normalize(query.trim()).split(/\s+/).filter(Boolean);
 if(!terms.length)return entries.slice(0,8);
 return entries.filter(entry=>{
  const text=normalize([entry.title,entry.kind==="files"?"":entry.body,entry.url,modules.find(module=>module.id===entry.kind)?.name||""].join(" "));
  return terms.every(term=>text.includes(term));
 }).slice(0,8);
}
