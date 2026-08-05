import { verifyEmailAddress } from "../../../../db/email-verification";
import { isSameOrigin } from "../../../request-security";
import { isVerificationToken } from "../../../verify-email/verification-flow";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { token?: unknown } | null;
  const token = body?.token;
  if (!isVerificationToken(token)) return Response.json({ error: "Ungültiger Bestätigungslink." }, { status: 400 });
  if (!(await verifyEmailAddress(token))) return Response.json({ error: "Dieser Bestätigungslink ist ungültig oder abgelaufen." }, { status: 400 });
  return Response.json({ message: "Deine E-Mail-Adresse wurde bestätigt. Du kannst dich jetzt anmelden." });
}
