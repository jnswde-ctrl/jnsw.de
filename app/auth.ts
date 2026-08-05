import { cookies } from "next/headers";
import type { AppUser } from "../db/users";
import { getSessionUser } from "../db/sessions";
export const SESSION_COOKIE = "jnsw_session";
export async function requireAppUser(): Promise<AppUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? getSessionUser(token) : null;
}
export function isActiveAdmin(user: AppUser) {
  return user.role === "admin" && user.status === "active";
}
export function publicUser(user: AppUser) {
  return { id: user.id, displayName: user.displayName, role: user.role, status: user.status, emailVerifiedAt: user.emailVerifiedAt, createdAt: user.createdAt, updatedAt: user.updatedAt, lastSignedInAt: user.lastSignedInAt };
}
/** Use this guard for private product data, never just the presence of a session. */
export async function requireActiveUser(): Promise<AppUser | null> {
  const user = await requireAppUser();
  return user?.status === "active" ? user : null;
}
export function sessionCookie(token: string, expiresAt: string) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}`;
}
export function expiredSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
