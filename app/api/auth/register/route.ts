import { createSession } from "../../../../db/sessions";
import {
  createPasswordUser,
  findUserByEmail,
  normalizeEmail,
  updatePassword,
} from "../../../../db/users";
import { isSameOrigin, publicUser, sessionCookie } from "../../../auth";
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
  const user = existing
    ? await updatePassword(existing.id, passwordHash)
    : await createPasswordUser({ email, displayName, passwordHash });
  const session = await createSession(user.id);
  const response = Response.json({ user: publicUser(user) }, { status: 201 });
  response.headers.append(
    "Set-Cookie",
    sessionCookie(session.token, session.expiresAt),
  );
  return response;
}
