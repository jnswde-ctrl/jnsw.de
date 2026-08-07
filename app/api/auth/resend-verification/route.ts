import {
  isVerificationEmailSendAllowed,
  prepareEmailVerificationToken,
  saveEmailVerificationToken,
} from "../../../../db/email-verification";
import { findUserByEmail, markVerificationEmailSent, normalizeEmail } from "../../../../db/users";
import { sendVerificationEmail } from "../../../mail";
import { isSameOrigin } from "../../../request-security";

const message =
  "Wenn für diese Adresse ein unbestätigtes Konto besteht, erhältst du in Kürze einen Bestätigungslink.";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const user = email ? await findUserByEmail(email) : undefined;
  if (
    !user ||
    user.status !== "active" ||
    user.emailVerifiedAt ||
    !user.passwordHash ||
    !isVerificationEmailSendAllowed(user.lastVerificationEmailSentAt)
  )
    return Response.json({ message }, { status: 202 });

  const verification = await prepareEmailVerificationToken();
  const verificationUrl = new URL("/verify-email", request.url);
  verificationUrl.searchParams.set("token", verification.token);
  try {
    await sendVerificationEmail({ to: user.email, verificationUrl: verificationUrl.toString() });
    await saveEmailVerificationToken(user.id, verification);
    await markVerificationEmailSent(user.id);
  } catch (error) {
    console.error("Unable to resend verification email", error);
  }
  return Response.json({ message }, { status: 202 });
}
