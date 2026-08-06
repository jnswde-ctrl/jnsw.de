import { eq, lt } from "drizzle-orm";
import { getDb } from ".";
import { sessions, users } from "./schema";
const encoder = new TextEncoder();
function toBase64(bytes: Uint8Array) {
  let text = "";
  for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text);
}
export function randomToken() {
  return toBase64(crypto.getRandomValues(new Uint8Array(32)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}
export async function hashToken(token: string) {
  return toBase64(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(token))));
}
export async function createSession(userId: string) {
  const token = randomToken(),
    expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  await getDb()
    .insert(sessions)
    .values({
      id: crypto.randomUUID(),
      userId,
      tokenHash: await hashToken(token),
      expiresAt,
    });
  return { token, expiresAt };
}
export async function getSessionUser(token: string) {
  const [result] = await getDb()
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.tokenHash, await hashToken(token)));
  if (!result || result.session.expiresAt <= new Date().toISOString()) {
    if (result) await getDb().delete(sessions).where(eq(sessions.id, result.session.id));
    return null;
  }
  return result.user;
}
export async function revokeSession(token: string) {
  await getDb()
    .delete(sessions)
    .where(eq(sessions.tokenHash, await hashToken(token)));
}
export async function removeExpiredSessions() {
  await getDb().delete(sessions).where(lt(sessions.expiresAt, new Date().toISOString()));
}
