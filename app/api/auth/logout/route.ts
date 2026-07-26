import { revokeSession } from "../../../../db/sessions";
import {
  expiredSessionCookie,
  isSameOrigin,
  SESSION_COOKIE,
} from "../../../auth";
import { cookies } from "next/headers";
export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) await revokeSession(token);
  const response = Response.json({ ok: true });
  response.headers.append("Set-Cookie", expiredSessionCookie());
  return response;
}
