import { verifyEmailAddress } from "../../../../db/email-verification";
import { isSameOrigin } from "../../../request-security";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { token?: unknown } | null;
  const token = typeof body?.token === "string" ? body.token : "";
  if (!token || token.length > 128) return Response.json({ error: "Ungültiger Bestätigungslink." }, { status: 400 });
  if (!(await verifyEmailAddress(token))) return Response.json({ error: "Dieser Bestätigungslink ist ungültig oder abgelaufen." }, { status: 400 });
  return Response.json({ message: "Deine E-Mail-Adresse wurde bestätigt. Du kannst dich jetzt anmelden." });
}
