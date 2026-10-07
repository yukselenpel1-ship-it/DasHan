import { getAuth, authConfigured } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handle(request: Request) {
  if (!authConfigured()) return Response.json({ error: "Giriş sistemi henüz yapılandırılmadı." }, { status: 503 });
  const handler = toNextJsHandler(getAuth());
  return request.method === "GET" ? handler.GET(request) : handler.POST(request);
}
export { handle as GET, handle as POST };
