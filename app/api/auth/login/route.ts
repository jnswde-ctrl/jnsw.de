import { createSession } from "../../../../db/sessions";
import { findUserByEmail, normalizeEmail } from "../../../../db/users";
import { isSameOrigin, publicUser, sessionCookie } from "../../../auth";
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
  const session = await createSession(user.id);
  const response = Response.json({ user: publicUser(user) });
  response.headers.append(
    "Set-Cookie",
    sessionCookie(session.token, session.expiresAt),
  );
  return response;
}
