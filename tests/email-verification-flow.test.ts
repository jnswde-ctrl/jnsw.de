import assert from "node:assert/strict";
import test from "node:test";
import {
  completeEmailVerification,
  isVerificationToken,
  maxVerificationTokenLength,
} from "../app/verify-email/verification-flow.ts";
import {
  isVerificationEmailSendAllowed,
  verificationResendCooldownMs,
} from "../db/email-verification-flow.ts";

test("accepts a bounded non-empty verification token", () => {
  assert.equal(isVerificationToken("valid-token"), true);
  assert.equal(isVerificationToken(""), false);
  assert.equal(isVerificationToken("x".repeat(maxVerificationTokenLength + 1)), false);
  assert.equal(isVerificationToken(undefined), false);
});

test("verifies a valid link once and safely rejects a repeated link", async () => {
  let consumed = false;
  const verify = async (token: string) => {
    assert.equal(token, "one-time-token");
    if (consumed) return false;
    consumed = true;
    return true;
  };

  assert.equal(await completeEmailVerification("one-time-token", verify), true);
  assert.equal(await completeEmailVerification("one-time-token", verify), false);
});

test("does not pass malformed tokens to the verification store", async () => {
  let calls = 0;
  assert.equal(
    await completeEmailVerification("", async () => {
      calls += 1;
      return true;
    }),
    false,
  );
  assert.equal(calls, 0);
});

test("allows another verification email only after the cooldown", () => {
  const now = Date.now();
  assert.equal(
    isVerificationEmailSendAllowed(
      new Date(now - verificationResendCooldownMs + 1).toISOString(),
      now,
    ),
    false,
  );
  assert.equal(
    isVerificationEmailSendAllowed(new Date(now - verificationResendCooldownMs).toISOString(), now),
    true,
  );
});
