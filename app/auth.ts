import { cookies } from "next/headers";
import { findOrCreateUser, type AppUser } from "../db/users";
import { getSessionUser } from "../db/sessions";
import { getChatGPTUser } from "./chatgpt-auth";
export const SESSION_COOKIE = "jnsw_session";
export async function requireAppUser(): Promise<AppUser | null> { const token = (await cookies()).get(SESSION_COOKIE)?.value; if (token) { const user = await getSessionUser(token); if (user) return user; } const identity = await getChatGPTUser(); return identity ? findOrCreateUser({ email: identity.email, displayName: identity.displayName }) : null; }
export function isActiveAdmin(user: AppUser) { return user.role === "admin" && user.status === "active"; }
export function publicUser(user: AppUser) { const { email, passwordHash, ...safeUser } = user; return safeUser; }
export function sessionCookie(token: string, expiresAt: string) { return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}`; }
export function expiredSessionCookie() { return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`; }
export function isSameOrigin(request: Request) { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; }
