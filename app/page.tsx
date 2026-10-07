import Dashboard from "@/components/dashboard/dashboard";
import WorkspaceAccess from "@/components/dashboard/workspace-access";
import {getWorkspaceUser} from "@/lib/session";
import {authConfigured} from "@/lib/auth";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export default async function Home(){
 if(!authConfigured())return <WorkspaceAccess available={false}/>;
 let user;
 try{user=await getWorkspaceUser();}catch{return <WorkspaceAccess available={false}/>;}
 if(!user)return <WorkspaceAccess available/>;
 return <Dashboard account={{userId:user.userId,user:{displayName:user.displayName,email:user.email},signInPath:"/?login=1"}}/>;
}
