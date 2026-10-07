"use client";
import {useState} from "react";
import {Network,ShieldCheck,LogIn,UserPlus,LogOut,LoaderCircle} from "lucide-react";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from "@/components/ui/dialog";
import {Tabs,TabsList,TabsTrigger,TabsContent} from "@/components/ui/tabs";
import {authClient} from "@/lib/auth-client";
export type AccountContext={userId?:string;user:{displayName:string;email:string}|null;signInPath:string};

function AccountForm({register=false}:{register?:boolean}){
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;setBusy(true);setError("");
  const form=new FormData(event.currentTarget),email=String(form.get("email")??""),password=String(form.get("password")??"");
  try{
   const result=register?await authClient.signUp.email({email,password,name:String(form.get("name")??""),fetchOptions:{headers:{"x-dashhan-setup-code":String(form.get("setupCode")??"")}}}):await authClient.signIn.email({email,password});
   if(result.error)throw new Error(result.error.status===429?"Çok fazla deneme yaptın. Bir dakika sonra yeniden dene.":register?"Hesap oluşturulamadı. E-posta ve kurulum kodunu kontrol et.":"Giriş yapılamadı. E-posta ve şifreni kontrol et.");
   window.location.replace("/");
  }catch(reason){setError(reason instanceof Error?reason.message:"İşlem tamamlanamadı.");setBusy(false);}
 }
 return <form className="record-form" onSubmit={event=>void submit(event)}>
  {register&&<label>Adın<input name="name" required maxLength={80} autoComplete="name" disabled={busy}/></label>}
  <label>E-posta<input name="email" type="email" required maxLength={254} autoComplete="email" autoFocus disabled={busy}/></label>
  <label>Şifre<input name="password" type="password" required minLength={register?12:1} maxLength={128} autoComplete={register?"new-password":"current-password"} disabled={busy}/></label>
  {register&&<><label>Kurulum kodu<input name="setupCode" type="password" required minLength={32} maxLength={256} autoComplete="off" disabled={busy}/></label><p className="vault-help">En az 12 karakterli bir şifre belirle. Kurulum kodu bu kişisel hesabı yalnızca senin oluşturmanı sağlar.</p></>}
  {error&&<p className="error-box" role="alert">{error}</p>}
  <button type="submit" className="account-action" disabled={busy}>{busy?<LoaderCircle size={17} className="spin"/>:register?<UserPlus size={17}/>:<LogIn size={17}/>} {register?"Hesabı oluştur":"Giriş yap"}</button>
 </form>;
}
export default function AccountDialog({open,onOpenChange,account}:{open:boolean;onOpenChange:(open:boolean)=>void;account:AccountContext}){
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function signOut(){setBusy(true);setError("");try{const result=await authClient.signOut();if(result.error)throw new Error();window.location.replace("/");}catch{setError("Oturum kapatılamadı. Yeniden dene.");setBusy(false);}}
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="account-dialog">
  <DialogHeader><span className="account-brand" aria-hidden="true"><Network size={28} strokeWidth={1.5}/></span><DialogTitle>Dash<span className="gold">HAN</span> hesabın</DialogTitle><DialogDescription>Kişisel çalışma alanına güvenli erişim.</DialogDescription></DialogHeader>
  {account.user?<div className="account-pane"><div className="account-current"><ShieldCheck size={21}/><div><span>Giriş yaptığın hesap</span><strong>{account.user.displayName}</strong><small>{account.user.email}</small></div></div>{error&&<p className="error-box" role="alert">{error}</p>}<button type="button" className="account-action account-action-secondary" disabled={busy} onClick={()=>void signOut()}><LogOut size={17}/>Çıkış yap</button></div>:<Tabs defaultValue="login" className="account-tabs"><TabsList aria-label="Hesap işlemleri"><TabsTrigger value="login"><LogIn size={16}/>Giriş yap</TabsTrigger><TabsTrigger value="register"><UserPlus size={16}/>Kayıt ol</TabsTrigger></TabsList><TabsContent value="login" className="account-pane"><AccountForm/></TabsContent><TabsContent value="register" className="account-pane"><AccountForm register/></TabsContent></Tabs>}
  <div className="account-security"><ShieldCheck size={15}/><span>Bu çalışma alanına erişim sahibine özeldir.</span></div>
 </DialogContent></Dialog>;
}
