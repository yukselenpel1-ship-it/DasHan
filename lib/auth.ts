import { timingSafeEqual } from "node:crypto";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { getPool } from "./database";

export function ownerEmail() { return process.env.DASHHAN_OWNER_EMAIL?.trim().toLowerCase() ?? ""; }
export function authConfigured() {
  return !!process.env.DATABASE_URL && (process.env.BETTER_AUTH_SECRET?.length ?? 0) >= 32 && !!ownerEmail();
}
export function validSetupCode(value: string) {
  const expected = process.env.DASHHAN_SETUP_CODE ?? "";
  const a = Buffer.from(value), b = Buffer.from(expected);
  return b.length >= 32 && a.length === b.length && timingSafeEqual(a, b);
}

export function authOptions() {
  if (!authConfigured()) throw new Error("Giriş sistemi henüz yapılandırılmadı.");
  return {
    appName: "DashHAN",
    database: getPool(),
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || undefined,
    emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128 },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: { enabled: true, storage: "database", window: 60, max: 30, customRules: { "/sign-in/email": { window: 60, max: 5 }, "/sign-up/email": { window: 60, max: 3 } } },
    hooks: {
      before: createAuthMiddleware(async context => {
        if (["/sign-up/email", "/sign-in/email"].includes(context.path)) {
          const email = String(context.body?.email ?? "").trim().toLowerCase();
          if (email !== ownerEmail()) throw new APIError("FORBIDDEN", { message: "Bu çalışma alanına erişim iznin yok." });
          if (context.path === "/sign-up/email" && !validSetupCode(context.headers?.get("x-dashhan-setup-code") ?? "")) {
            throw new APIError("FORBIDDEN", { message: "Hesap oluşturmak için geçerli kurulum kodunu gir." });
          }
        }
        if (["/delete-user", "/change-email"].includes(context.path)) throw new APIError("FORBIDDEN", { message: "Bu hesap işlemi desteklenmiyor." });
      }),
    },
    plugins: [nextCookies()],
  } satisfies BetterAuthOptions;
}
function createAuth() { return betterAuth(authOptions()); }
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() { return instance ??= createAuth(); }
