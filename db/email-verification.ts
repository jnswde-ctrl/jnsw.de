import { and, eq, gt, lt } from "drizzle-orm";
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
  const now = new Date().toISOString();
  const [record] = await db
    .delete(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.tokenHash, await hashToken(token)),
        gt(emailVerificationTokens.expiresAt, now),
      ),
    )
    .returning({ userId: emailVerificationTokens.userId });
  if (!record) return false;
  await db.update(users).set({ emailVerifiedAt: now, updatedAt: now }).where(eq(users.id, record.userId));
  return true;
}

export async function removeExpiredEmailVerificationTokens() {
  await getDb().delete(emailVerificationTokens).where(lt(emailVerificationTokens.expiresAt, new Date().toISOString()));
}
