import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db, now } from "./db";

const ACCESS_COOKIE = "interview_access";
const REFRESH_COOKIE = "interview_refresh";
const secretValue = process.env.AUTH_SECRET ?? process.env.SUPABASE_JWT_SECRET ?? "";
const accessSecret = new TextEncoder().encode(secretValue);
const accessMinutes = 15;
const refreshDays = 30;

export type Role = "admin" | "user";
type User = { id: string; email: string; name: string; role: Role };
type TokenRow = { id: string; user_id: string; expires_at: string; revoked_at: string | null };

function assertSecret() {
  if (!secretValue) throw new Error("AUTH_SECRET or SUPABASE_JWT_SECRET is required.");
}
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
function cookieOptions(maxAge: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge };
}
async function signAccess(user: User) {
  assertSecret();
  return new SignJWT({ email: user.email, name: user.name, role: user.role }).setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id).setIssuedAt().setExpirationTime(`${accessMinutes}m`).sign(accessSecret);
}
export async function setSession(user: User) {
  const refresh = randomBytes(48).toString("base64url");
  await db("refresh_tokens", { method: "POST", body: JSON.stringify({
    user_id: user.id, token_hash: hashToken(refresh),
    expires_at: new Date(Date.now() + refreshDays * 86400000).toISOString(),
  }) });
  const store = await cookies();
  store.set(ACCESS_COOKIE, await signAccess(user), cookieOptions(accessMinutes * 60));
  store.set(REFRESH_COOKIE, refresh, cookieOptions(refreshDays * 86400));
}
export async function clearSession() {
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (refresh) await db(`refresh_tokens?token_hash=eq.${hashToken(refresh)}`, { method: "PATCH", body: JSON.stringify({ revoked_at: now() }) });
  store.delete(ACCESS_COOKIE); store.delete(REFRESH_COOKIE);
}
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, accessSecret);
      const role = payload.role === "admin" ? "admin" : "user";
      return { id: String(payload.sub), email: String(payload.email), name: String(payload.name), role };
  } catch { return null; }
}
export async function refreshSession(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(REFRESH_COOKIE)?.value;
  if (!token) return null;
  const rows = await db<(TokenRow & { users: User })[]>(
    `refresh_tokens?token_hash=eq.${hashToken(token)}&revoked_at=is.null&select=id,user_id,expires_at,revoked_at,users(id,email,name,role)`,
  );
  const row = rows[0];
  if (!row || new Date(row.expires_at) <= new Date()) return null;
  await db(`refresh_tokens?id=eq.${encodeURIComponent(row.id)}`, { method: "PATCH", body: JSON.stringify({ revoked_at: now() }) });
  await setSession(row.users);
  return row.users;
}
export const userByEmail = (email: string) =>
  db<(User & { password_hash: string })[]>(`users?email=eq.${encodeURIComponent(email.toLowerCase())}&select=id,email,name,role,password_hash`);
export { hashToken };
