import { createSession } from "../../../../db/sessions";
import { createEmailVerificationToken } from "../../../../db/email-verification";
import { findUserByEmail, normalizeEmail } from "../../../../db/users";
import { sendVerificationEmail } from "../../../mail";
import { publicUser, sessionCookie } from "../../../auth";
import { isSameOrigin } from "../../../request-security";
import { verifyPassword } from "../../../passwords";
export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
  } | null;
  const email =
    typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const user = email ? await findUserByEmail(email) : undefined;
  if (
    !user?.passwordHash ||
    !(await verifyPassword(password, user.passwordHash))
  )
    return Response.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  if (user.status !== "active")
    return Response.json({ error: "Account suspended" }, { status: 403 });
  if (!user.emailVerifiedAt) {
    const { token } = await createEmailVerificationToken(user.id);
    const verificationUrl = new URL("/verify-email", request.url);
    verificationUrl.searchParams.set("token", token);
    try {
      await sendVerificationEmail({ to: user.email, verificationUrl: verificationUrl.toString() });
    } catch (error) {
      console.error("Unable to resend verification email", error);
      return Response.json({ error: "Die Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut." }, { status: 503 });
    }
    return Response.json({ message: "Deine E-Mail-Adresse ist noch nicht bestätigt. Wir haben dir einen neuen Bestätigungslink gesendet." }, { status: 202 });
  }
  const session = await createSession(user.id);
  const response = Response.json({ user: publicUser(user) });
  response.headers.append(
    "Set-Cookie",
    sessionCookie(session.token, session.expiresAt),
  );
  return response;
}
