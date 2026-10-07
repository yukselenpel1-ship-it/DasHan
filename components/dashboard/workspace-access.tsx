"use client";
import Image from "next/image";
import {useState} from "react";
import {LockKeyhole,LogIn} from "lucide-react";
import AccountDialog from "./account-dialog";
export default function WorkspaceAccess({available}:{available:boolean}){
 const [open,setOpen]=useState(available);
 return <main className="workspace-access"><div className="access-card"><Image src="/dashhan-logo.png" alt="DashHAN" width={86} height={86} priority/><p className="eyebrow">KİŞİSEL KONTROL MERKEZİ</p><h1>Dash<span className="gold">HAN</span></h1><p>{available?"Planların, projelerin ve özel notların tek bir yerde. Devam etmek için hesabınla giriş yap.":"Çalışma alanı henüz hazır değil. Bağlantılar tamamlandığında buradan giriş yapabilirsin."}</p>{available?<button className="account-action" onClick={()=>setOpen(true)}><LogIn size={18}/>Giriş yap</button>:<span className="account-security"><LockKeyhole size={17}/>Çalışma alanın kilitli</span>}</div>{available&&<AccountDialog open={open} onOpenChange={setOpen} account={{user:null,signInPath:"/?login=1"}}/>}</main>;
}
