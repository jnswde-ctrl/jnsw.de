import {
  createPasswordUser,
  findUserByEmail,
  markVerificationEmailSent,
  normalizeEmail,
} from "../../../../db/users";
import { createEmailVerificationToken } from "../../../../db/email-verification";
import { sendVerificationEmail } from "../../../mail";
import { isSameOrigin } from "../../../request-security";
import { hashPassword, isValidPassword } from "../../../passwords";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    displayName?: unknown;
    password?: unknown;
  } | null;
  const email =
    typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const displayName =
    typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (
    !emailPattern.test(email) ||
    !displayName ||
    displayName.length > 100 ||
    !isValidPassword(password)
  )
    return Response.json(
      {
        error:
          "Use a valid email, a display name, and a password with at least 12 characters",
      },
      { status: 400 },
    );
  const existing = await findUserByEmail(email);
  if (existing)
    return Response.json(
      { error: "An account already exists for this email" },
      { status: 409 },
    );
  const passwordHash = await hashPassword(password);
  const user = await createPasswordUser({ email, displayName, passwordHash });
  const { token } = await createEmailVerificationToken(user.id);
  const verificationUrl = new URL("/verify-email", request.url);
  verificationUrl.searchParams.set("token", token);
  try {
    await sendVerificationEmail({ to: user.email, verificationUrl: verificationUrl.toString() });
    await markVerificationEmailSent(user.id);
  } catch (error) {
    console.error("Unable to send verification email", error);
    return Response.json({ error: "Dein Konto wurde angelegt, aber die Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte versuche die Anmeldung später erneut." }, { status: 503 });
  }
  return Response.json({ message: "Dein Konto ist angelegt. Bitte bestätige jetzt die E-Mail-Adresse über den Link in deinem Postfach." }, { status: 201 });
}
