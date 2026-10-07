"use client";
import {useEffect,useId,useRef,useState} from "react";
import {Search,X,LoaderCircle} from "lucide-react";
import {modules,type Entry} from "@/lib/dashhan";
import {searchEntries} from "@/lib/workspace-search";

export default function WorkspaceSearch({entries,loading,onSelect}:{entries:Entry[];loading:boolean;onSelect:(entry:Entry)=>void}){
 const [query,setQuery]=useState(""),[open,setOpen]=useState(false),[active,setActive]=useState(0);
 const root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null),id=useId();
 const results=searchEntries(entries,query);
 useEffect(()=>{
  const keyboard=(event:KeyboardEvent)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();input.current?.focus();setOpen(true);}};
  const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};
  window.addEventListener("keydown",keyboard);document.addEventListener("pointerdown",outside);
  return()=>{window.removeEventListener("keydown",keyboard);document.removeEventListener("pointerdown",outside);};
 },[]);
 const select=(entry:Entry)=>{setOpen(false);setQuery("");setActive(0);onSelect(entry);};
 const close=()=>{setOpen(false);input.current?.blur();};
 return <div ref={root} className={`topbar-search ${open?"search-open":""}`} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false);}}>
  <div className="top-command" onClick={()=>input.current?.focus()}>
   <Search size={19} strokeWidth={1.6}/>
   <input ref={input} type="search" role="combobox" value={query} onChange={event=>{setQuery(event.target.value);setActive(0);setOpen(true);}} onFocus={()=>setOpen(true)} placeholder="Kayıtlarında ara…" aria-label="Tüm kayıtlarında ara" aria-expanded={open} aria-controls={id} aria-autocomplete="list" aria-keyshortcuts="Control+K Meta+K" aria-activedescendant={open&&!loading&&results[Math.min(active,results.length-1)]?`${id}-${Math.min(active,results.length-1)}`:undefined} autoComplete="off" maxLength={200} onKeyDown={event=>{
    if(event.key==="Escape"){event.preventDefault();event.stopPropagation();close();}
    if(event.key==="ArrowDown"){event.preventDefault();setOpen(true);setActive(index=>Math.max(0,Math.min(index+1,results.length-1)));}
    if(event.key==="ArrowUp"){event.preventDefault();setActive(index=>Math.max(index-1,0));}
    if(event.key==="Enter"){event.preventDefault();const entry=results[Math.min(active,results.length-1)];if(entry)select(entry);}
   }}/>
   <span className="top-command-keys" aria-hidden="true"><kbd>Ctrl</kbd><kbd>K</kbd></span>
   <button className="search-close" type="button" onClick={event=>{event.stopPropagation();close();}} aria-label="Aramayı kapat"><X size={17}/></button>
  </div>
  {open&&<div className="search-results"><div className="search-results-heading">{query.trim()?"Arama sonuçları":"Son kayıtlar"}</div>{loading?<p className="search-empty"><LoaderCircle size={16} className="spin"/>Kayıtlar yükleniyor…</p>:results.length?<div id={id} role="listbox" aria-label="Bulunan kayıtlar">{results.map((entry,index)=><button key={entry.id} id={`${id}-${index}`} type="button" role="option" aria-selected={index===Math.min(active,results.length-1)} onMouseDown={event=>event.preventDefault()} onClick={()=>select(entry)} className={index===Math.min(active,results.length-1)?"search-result active":"search-result"}><span><strong>{entry.title}</strong><small>{entry.kind==="files"?"Dosyayı aç":entry.body.slice(0,80)||entry.url||"Kaydı aç"}</small></span><em>{modules.find(module=>module.id===entry.kind)?.name}</em></button>)}</div>:<p id={id} className="search-empty">{query.trim()?"Bu aramayla eşleşen kayıt yok.":"Kayıt ekledikten sonra burada arayabilirsin."}</p>}</div>}
 </div>;
}
