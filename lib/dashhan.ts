export const modules = [
 {id:"projects",name:"Projeler",color:"#b198f0",label:"FİKİRDEN GERÇEĞE"},
 {id:"tasks",name:"Görevler",color:"#82e8d1",label:"BİR SONRAKİ ADIM"},
 {id:"calendar",name:"Ajanda",color:"#e8b2cd",label:"ZAMANINI PLANLA"},
 {id:"notes",name:"Notlar",color:"#a8baf5",label:"AKLINDA KALMASIN"},
 {id:"files",name:"Dosyalar",color:"#92c7e2",label:"HER ŞEY YERİNDE"},
 {id:"finance",name:"Finans",color:"#dec78f",label:"GELİR VE GİDER"},
 {id:"links",name:"Hızlı linkler",color:"#a9df99",label:"TEK TIK UZAKTA"},
] as const;
export type Kind=typeof modules[number]["id"];
export type Entry={id:string;kind:Kind;title:string;body:string;status:number;date:string;url:string;amount:number;priority:string;created:string};
export const kindIds=modules.map(m=>m.id);