import { dashboard } from "../../../../db/applications";
import { activeUser, denied, mutationAllowed, privateHeaders } from "../support";
export async function GET() {
  const user = await activeUser();
  return user
    ? Response.json(await dashboard(user.id), { headers: privateHeaders })
    : denied(401, "Authentication required");
}
export async function POST(request: Request) {
  if (!mutationAllowed(request)) return denied(403, "Invalid origin");
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  return denied(409, "Create an opportunity and convert it to an application instead");
}
