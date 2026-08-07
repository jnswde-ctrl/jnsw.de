import { isActiveAdmin, publicUser, requireAppUser } from "../../../auth";
import { listUsers } from "../../../../db/users";
export async function GET(request: Request) {
  const actor = await requireAppUser();
  if (!actor) return Response.json({ error: "Authentication required" }, { status: 401 });
  if (!isActiveAdmin(actor))
    return Response.json({ error: "Administrator access required" }, { status: 403 });
  const url = new URL(request.url);
  const a = Number(url.searchParams.get("limit") ?? "50"),
    b = Number(url.searchParams.get("offset") ?? "0");
  const limit = Number.isInteger(a) ? Math.min(Math.max(a, 1), 100) : 50;
  const offset = Number.isInteger(b) ? Math.max(b, 0) : 0;
  const result = await listUsers({ limit, offset });
  return Response.json({
    users: result.items.map(publicUser),
    total: result.total,
    limit,
    offset,
  });
}
