import { and, eq, gt, lt } from "drizzle-orm";
import { getDb } from ".";
import { hashToken, randomToken } from "./sessions";
import { emailVerificationTokens, users } from "./schema";
export {
  isVerificationEmailSendAllowed,
  verificationResendCooldownMs,
} from "./email-verification-flow";

const verificationLifetimeMs = 1000 * 60 * 60 * 24;

export async function prepareEmailVerificationToken() {
  const token = randomToken();
  return {
    token,
    tokenHash: await hashToken(token),
    expiresAt: new Date(Date.now() + verificationLifetimeMs).toISOString(),
  };
}

export async function saveEmailVerificationToken(
  userId: string,
  verification: Awaited<ReturnType<typeof prepareEmailVerificationToken>>,
) {
  const db = getDb();
  await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId));
  await db.insert(emailVerificationTokens).values({
    id: crypto.randomUUID(),
    userId,
    tokenHash: verification.tokenHash,
    expiresAt: verification.expiresAt,
  });
}

export async function createEmailVerificationToken(userId: string) {
  const verification = await prepareEmailVerificationToken();
  await saveEmailVerificationToken(userId, verification);
  return verification;
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
  await db
    .update(users)
    .set({ emailVerifiedAt: now, updatedAt: now })
    .where(eq(users.id, record.userId));
  return true;
}

export async function removeExpiredEmailVerificationTokens() {
  await getDb()
    .delete(emailVerificationTokens)
    .where(lt(emailVerificationTokens.expiresAt, new Date().toISOString()));
}
