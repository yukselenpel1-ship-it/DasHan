export type SealedNote={version:1;salt:string;iv:string;ciphertext:string};
export type StoredNote=SealedNote&{revision:number;updated:string};
export const PRIVATE_NOTE_LIMIT=100000;
const iterations=600000;
const encode=(bytes:Uint8Array)=>{let text="";for(const byte of bytes)text+=String.fromCharCode(byte);return btoa(text);};
const decode=(text:string)=>Uint8Array.from(atob(text),char=>char.charCodeAt(0));
export const createSalt=()=>encode(crypto.getRandomValues(new Uint8Array(16)));
export async function deriveNoteKey(password:string,salt:string){
 const material=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveKey"]);
 return crypto.subtle.deriveKey({name:"PBKDF2",hash:"SHA-256",salt:decode(salt),iterations},material,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
export async function sealNote(text:string,key:CryptoKey,salt:string):Promise<SealedNote>{
 if(text.length>PRIVATE_NOTE_LIMIT)throw new Error("Notun çok uzun. En fazla 100.000 karakter kullanabilirsin.");
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const encrypted=await crypto.subtle.encrypt({name:"AES-GCM",iv,additionalData:new TextEncoder().encode("DashHAN/private-note/v1")},key,new TextEncoder().encode(text));
 return {version:1,salt,iv:encode(iv),ciphertext:encode(new Uint8Array(encrypted))};
}
export async function openNote(note:SealedNote,key:CryptoKey){
 const decrypted=await crypto.subtle.decrypt({name:"AES-GCM",iv:decode(note.iv),additionalData:new TextEncoder().encode("DashHAN/private-note/v1")},key,decode(note.ciphertext));
 return new TextDecoder().decode(decrypted);
}
