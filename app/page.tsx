import Dashboard from "@/components/dashboard/dashboard";
import {getChatGPTUser,chatGPTSignInPath,chatGPTSignOutPath} from "./chatgpt-auth";
export const dynamic="force-dynamic";
export default async function Home(){
 const user=await getChatGPTUser();
 return <Dashboard account={{user:user?{displayName:user.displayName,email:user.email}:null,signInPath:chatGPTSignInPath("/"),signOutPath:chatGPTSignOutPath("/")}}/>;
}
