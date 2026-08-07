import { createCareerItem, listCareerItems } from "../../../../db/applications";
import { careerItemKindValues } from "../../../../db/schema";
import { activeUser, denied, json, mutationAllowed, privateHeaders, text } from "../support";
export async function GET() {
  const user = await activeUser();
  return user
    ? Response.json({ items: await listCareerItems(user.id) }, { headers: privateHeaders })
    : denied(401, "Authentication required");
}
export async function POST(request: Request) {
  if (!mutationAllowed(request)) return denied(403, "Invalid origin");
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  const body = await json(request),
    kind = body?.kind,
    title = text(body?.title, 160, true),
    organization = text(body?.organization, 160),
    description = text(body?.description, 8000) ?? "",
    link = text(body?.link, 2048);
  if (!title || !careerItemKindValues.includes(kind as never) || (link && !URL.canParse(link)))
    return denied(400, "Invalid profile item");
  return Response.json(
    {
      item: await createCareerItem(user.id, {
        kind: kind as never,
        title,
        organization: organization || null,
        description,
        link: link || null,
      }),
    },
    { status: 201, headers: privateHeaders },
  );
}
