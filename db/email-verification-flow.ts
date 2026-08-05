export const verificationResendCooldownMs = 1000 * 60 * 5;

export function isVerificationEmailSendAllowed(lastSentAt: string | null, now = Date.now()) {
  return !lastSentAt || Date.parse(lastSentAt) + verificationResendCooldownMs <= now;
}
