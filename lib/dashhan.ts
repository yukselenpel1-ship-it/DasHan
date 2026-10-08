export const modules = [
 {id:"projects",name:"Projeler",color:"#a6afff",label:"FİKİRDEN GERÇEĞE"},
 {id:"tasks",name:"Görevler",color:"#828fff",label:"BİR SONRAKİ ADIM"},
 {id:"calendar",name:"Ajanda",color:"#b5a4e8",label:"ZAMANINI PLANLA"},
 {id:"notes",name:"Notlar",color:"#93a2ed",label:"AKLINDA KALMASIN"},
 {id:"files",name:"Dosyalar",color:"#8c9dcc",label:"HER ŞEY YERİNDE"},
 {id:"finance",name:"Finans",color:"#c0b5db",label:"GELİR VE GİDER"},
 {id:"links",name:"Hızlı linkler",color:"#a4b5e0",label:"TEK TIK UZAKTA"},
] as const;
export type Kind=typeof modules[number]["id"];
export type Entry={id:string;kind:Kind;title:string;body:string;status:number;date:string;url:string;amount:number;priority:string;created:string};
export const kindIds=modules.map(m=>m.id);