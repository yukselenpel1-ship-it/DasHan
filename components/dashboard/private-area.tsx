"use client";
import {useEffect,useRef,useState} from "react";
import {LockKeyhole,LoaderCircle,Save,ShieldCheck,RefreshCw} from "lucide-react";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from "@/components/ui/dialog";
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogAction,AlertDialogCancel,AlertDialogFooter} from "@/components/ui/alert-dialog";
import {createSalt,deriveNoteKey,openNote,sealNote,PRIVATE_NOTE_LIMIT,type StoredNote} from "@/lib/private-area";

async function storeNote(note:unknown){
 const response=await fetch("/api/private-area",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(note)});
 const value=await response.json() as {note:StoredNote;error?:string};
 if(!response.ok)throw new Error(value.error||"Not kaydedilemedi.");
 return value.note;
}

export default function PrivateArea({open,onOpenChange,signInPath}:{open:boolean;onOpenChange:(open:boolean)=>void;signInPath:string}){
 const [phase,setPhase]=useState<"loading"|"setup"|"locked"|"unlocked"|"error">("loading"),[note,setNote]=useState<StoredNote|null>(null),[text,setText]=useState(""),[saved,setSaved]=useState(""),[password,setPassword]=useState(""),[confirmation,setConfirmation]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0),[needsLogin,setNeedsLogin]=useState(false);
 const [reloadConfirm,setReloadConfirm]=useState(false);
 const key=useRef<CryptoKey|null>(null),working=useRef(false);
 const dirty=text!==saved;
 useEffect(()=>{
  key.current=null;setPassword("");setConfirmation("");setText("");setSaved("");setNote(null);setError("");setNeedsLogin(false);
  if(!open)return;
  const controller=new AbortController();let cancelled=false;setPhase("loading");
  void fetch("/api/private-area",{cache:"no-store",signal:controller.signal}).then(async response=>{
   const value=await response.json() as {note:StoredNote|null;error?:string};
   if(cancelled)return;
   if(!response.ok){setNeedsLogin(response.status===401);throw new Error(value.error||"Özel alan yüklenemedi.");}
   setNote(value.note);setPhase(value.note?"locked":"setup");
  }).catch(reason=>{if(!cancelled){setError(reason instanceof Error?reason.message:"Özel alan yüklenemedi.");setPhase("error");}});
  return()=>{cancelled=true;controller.abort();key.current=null;};
 },[open,retry]);

 async function unlock(){
  if(working.current)return;
  if(phase==="setup"&&(password.length<8||password!==confirmation)){setError(password.length<8?"En az 8 karakterli bir şifre belirle.":"Şifreler aynı olmalı.");return;}
  working.current=true;setBusy(true);setError("");
  try{
   const salt=note?.salt||createSalt(),derived=await deriveNoteKey(password,salt);
   if(phase==="setup"){
    const created=await storeNote({...await sealNote("",derived,salt),revision:0});setNote(created);setText("");setSaved("");
   }else{
    if(!note)throw new Error("Özel alan yeniden açılmalı.");
    const content=await openNote(note,derived);setText(content);setSaved(content);
   }
   key.current=derived;setPassword("");setConfirmation("");setPhase("unlocked");
  }catch(reason){setError(reason instanceof DOMException&&reason.name==="OperationError"?"Şifre yanlış veya not okunamıyor. Yeniden dene.":reason instanceof Error?reason.message:"Özel alan açılamadı.");}
  finally{working.current=false;setBusy(false);}
 }
 async function save(){
  if(working.current||!key.current||!note)return false;
  working.current=true;setBusy(true);setError("");
  try{
   const updated=await storeNote({...await sealNote(text,key.current,note.salt),revision:note.revision});
   setNote(updated);setSaved(text);return true;
  }catch(reason){setError(reason instanceof Error?reason.message:"Not kaydedilemedi.");return false;}
  finally{working.current=false;setBusy(false);}
 }
 async function close(){
  if(working.current)return;
  if(phase==="unlocked"&&dirty&&!await save())return;
  key.current=null;setPassword("");setConfirmation("");setText("");setSaved("");setPhase("locked");onOpenChange(false);
 }
 return <Dialog open={open} onOpenChange={next=>{if(!next)void close();}}>
  <DialogContent className={`record-dialog private-area-dialog ${phase==="unlocked"?"private-area-editor":""}`} onEscapeKeyDown={event=>{if(working.current)event.preventDefault();}}>
   <DialogHeader><span className="account-brand" aria-hidden="true"><LockKeyhole size={26}/></span><DialogTitle>Özel alan</DialogTitle><DialogDescription>{phase==="unlocked"?"Notlarını yaz. Pencereyi kapattığında kaydedilir ve kilitlenir.":phase==="setup"?"İlk kez açarken yalnızca senin bildiğin bir şifre belirle.":"Notlarını açmak için özel alan şifreni gir."}</DialogDescription></DialogHeader>
   {phase==="loading"?<p className="vault-loading"><LoaderCircle size={20} className="spin"/>Özel alan yükleniyor…</p>:phase==="error"?<div className="vault-error-state"><p className="error-box" role="alert">{error}</p>{needsLogin?<a className="account-action" href={signInPath} target="_top">ChatGPT ile giriş yap</a>:<button className="account-action" onClick={()=>setRetry(value=>value+1)}><RefreshCw size={16}/>Yeniden dene</button>}</div>:phase==="unlocked"?<>
    <label className="private-note-label" htmlFor="private-note">Özel notlarım</label>
    <textarea id="private-note" className="private-note" autoFocus value={text} onChange={event=>setText(event.target.value)} maxLength={PRIVATE_NOTE_LIMIT} disabled={busy} placeholder="Notlarını buraya yaz…" spellCheck/>
    {error&&<div className="error-box" role="alert">{error}<button onClick={()=>setReloadConfirm(true)} disabled={busy}><RefreshCw size={14}/>Güncel notu yeniden yükle</button></div>}
    <div className="vault-status" aria-live="polite"><span>{busy?"Kaydediliyor…":dirty?"Kaydedilmemiş değişiklikler":note?`Kaydedildi · ${new Date(note.updated).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit",timeZone:"Europe/Istanbul"})}`:""}</span><span>{text.length.toLocaleString("tr-TR")} karakter</span></div>
    <div className="vault-actions"><button className="account-action account-action-secondary" disabled={busy} onClick={()=>void close()}><LockKeyhole size={16}/>{dirty?"Kaydet ve kilitle":"Kilitle"}</button><button className="account-action" disabled={busy||!dirty} onClick={()=>void save()}>{busy?<LoaderCircle size={16} className="spin"/>:<Save size={16}/>}Kaydet</button></div>
   </>:<form className="record-form vault-password" onSubmit={event=>{event.preventDefault();void unlock();}}>
    <label>Şifre<input type="password" autoFocus required minLength={phase==="setup"?8:1} maxLength={256} autoComplete={phase==="setup"?"new-password":"current-password"} value={password} onChange={event=>setPassword(event.target.value)} disabled={busy}/></label>
    {phase==="setup"&&<><label>Şifreyi tekrar gir<input type="password" required minLength={8} maxLength={256} autoComplete="new-password" value={confirmation} onChange={event=>setConfirmation(event.target.value)} disabled={busy}/></label><p className="vault-help">Şifreni unutursan bu notları açamazsın.</p></>}
    {error&&<div className="error-box" role="alert">{error}</div>}
    <button className="account-action" type="submit" disabled={busy||!password}>{busy?<LoaderCircle size={17} className="spin"/>:<LockKeyhole size={17}/>} {phase==="setup"?"Şifreyi belirle ve aç":"Özel alanı aç"}</button>
   </form>}
   <div className="account-security"><ShieldCheck size={15}/><span>Şifreli notlar · Pencere kapanınca kilitlenir</span></div>
   <AlertDialog open={reloadConfirm} onOpenChange={setReloadConfirm}><AlertDialogContent className="record-dialog"><AlertDialogTitle>Notları yeniden yükle?</AlertDialogTitle><AlertDialogDescription>Kaydedilmemiş değişikliklerin silinecek. Gerekirse önce notunu kopyala.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Vazgeç</AlertDialogCancel><AlertDialogAction onClick={()=>{setReloadConfirm(false);setRetry(value=>value+1);}}>Yeniden yükle</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </DialogContent>
 </Dialog>;
}
