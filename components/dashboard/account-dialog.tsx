"use client";

import {Network,ShieldCheck,LogIn,UserPlus,LogOut} from "lucide-react";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from "@/components/ui/dialog";
import {Tabs,TabsList,TabsTrigger,TabsContent} from "@/components/ui/tabs";

export type AccountContext={
 user:{displayName:string;email:string}|null;
 signInPath:string;
 signOutPath:string;
};

export default function AccountDialog({open,onOpenChange,account}:{open:boolean;onOpenChange:(open:boolean)=>void;account:AccountContext}){
 return <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="account-dialog">
   <DialogHeader>
    <span className="account-brand" aria-hidden="true"><Network size={28} strokeWidth={1.5}/></span>
    <DialogTitle>Dash<span className="gold">HAN</span> hesabın</DialogTitle>
    <DialogDescription>Kişisel çalışma alanına güvenli erişim.</DialogDescription>
   </DialogHeader>
   <Tabs defaultValue="login" className="account-tabs">
    <TabsList aria-label="Hesap işlemleri"><TabsTrigger value="login"><LogIn size={16}/>Giriş yap</TabsTrigger><TabsTrigger value="register"><UserPlus size={16}/>Kayıt ol</TabsTrigger></TabsList>
    <TabsContent value="login" className="account-pane">
     {account.user?<>
      <div className="account-current"><ShieldCheck size={21}/><div><span>Giriş yaptığın hesap</span><strong>{account.user.displayName}</strong>{account.user.displayName!==account.user.email&&<small>{account.user.email}</small>}</div></div>
      <p>ChatGPT hesabınla oturumun açık.</p>
      <a className="account-action account-action-secondary" href={account.signOutPath} target="_top"><LogOut size={17}/>Çıkış yap</a>
     </>:<>
      <h3>Tekrar hoş geldin</h3>
      <p>ChatGPT hesabınla giriş yaparak çalışma alanına devam et.</p>
      <a className="account-action" href={account.signInPath} target="_top"><LogIn size={17}/>ChatGPT ile giriş yap</a>
     </>}
    </TabsContent>
    <TabsContent value="register" className="account-pane">
     <h3>Hesabını oluştur</h3>
     <p>ChatGPT hesabın yoksa giriş ekranındaki kayıt adımıyla yeni bir hesap oluşturabilirsin.</p>
     {account.user?<>
      <p className="account-note">Yeni hesapla devam etmek için önce mevcut oturumundan çıkış yap.</p>
      <a className="account-action" href={account.signOutPath} target="_top"><LogOut size={17}/>Çıkış yap ve devam et</a>
     </>:<a className="account-action" href={account.signInPath} target="_top"><UserPlus size={17}/>ChatGPT ile kayıt ol</a>}
    </TabsContent>
   </Tabs>
   <div className="account-security"><ShieldCheck size={15}/><span>Bu çalışma alanına erişim sahibine özeldir.</span></div>
  </DialogContent>
 </Dialog>;
}
