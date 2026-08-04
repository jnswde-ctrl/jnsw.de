import { eq, lt } from "drizzle-orm";
import { getDb } from ".";
import { hashToken, randomToken } from "./sessions";
import { emailVerificationTokens, users } from "./schema";

const verificationLifetimeMs = 1000 * 60 * 60 * 24;

export async function createEmailVerificationToken(userId: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + verificationLifetimeMs).toISOString();
  const db = getDb();
  await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId));
  await db.insert(emailVerificationTokens).values({ id: crypto.randomUUID(), userId, tokenHash: await hashToken(token), expiresAt });
  return { token, expiresAt };
}

export async function verifyEmailAddress(token: string) {
  const db = getDb();
  const record = await db.query.emailVerificationTokens.findFirst({ where: eq(emailVerificationTokens.tokenHash, await hashToken(token)) });
  if (!record || record.expiresAt <= new Date().toISOString()) {
    if (record) await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, record.id));
    return false;
  }
  const now = new Date().toISOString();
  await db.update(users).set({ emailVerifiedAt: now, updatedAt: now }).where(eq(users.id, record.userId));
  await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, record.id));
  return true;
}

export async function removeExpiredEmailVerificationTokens() {
  await getDb().delete(emailVerificationTokens).where(lt(emailVerificationTokens.expiresAt, new Date().toISOString()));
}
