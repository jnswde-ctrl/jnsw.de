import { createOpportunity, listOpportunities } from "../../../../db/opportunities";
import { activeUser, denied, json, mutationAllowed, privateHeaders } from "../support";
import { createOpportunityPayload } from "./payload";

export async function GET() {
  const user = await activeUser();
  return user
    ? Response.json(
        { opportunities: await listOpportunities(user.id) },
        { headers: privateHeaders },
      )
    : denied(401, "Authentication required");
}

export async function POST(request: Request) {
  if (!mutationAllowed(request)) return denied(403, "Invalid origin");
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  const data = createOpportunityPayload(await json(request));
  if (!data) return denied(400, "Invalid opportunity data");
  try {
    const opportunity = await createOpportunity(user.id, data);
    return Response.json({ opportunity }, { status: 201, headers: privateHeaders });
  } catch {
    return denied(409, "Opportunity source key already exists");
  }
}
