import { headers } from "next/headers";
import { authConfigured, getAuth, ownerEmail } from "./auth";

export class AccessError extends Error { constructor() { super("Çalışma alanını açmak için giriş yap."); } }
export async function getWorkspaceUser() {
  if (!authConfigured()) return null;
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session || session.user.email.trim().toLowerCase() !== ownerEmail()) return null;
  return { userId: session.user.id, displayName: session.user.name, email: session.user.email };
}
export async function requireWorkspaceUser() {
  const user = await getWorkspaceUser();
  if (!user) throw new AccessError();
  return user;
}
