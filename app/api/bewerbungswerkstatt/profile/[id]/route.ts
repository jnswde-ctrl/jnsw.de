import { deleteCareerItem, updateCareerItem } from "../../../../../db/applications";
import { careerItemKindValues } from "../../../../../db/schema";
import { activeUser, denied, json, mutationAllowed, privateHeaders, text } from "../../support";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Context) {
  if (!mutationAllowed(request)) return denied(403, "Invalid origin");
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  const body = await json(request);
  const rawKind = body?.kind;
  const kind = careerItemKindValues.includes(rawKind as never) ? rawKind : undefined;
  const title = text(body?.title, 160, true) ?? undefined,
    organization = text(body?.organization, 160) ?? undefined,
    description = text(body?.description, 8000) ?? undefined,
    link = text(body?.link, 2048) ?? undefined;
  if (link && !URL.canParse(link)) return denied(400, "Invalid profile item");
  const item = await updateCareerItem(user.id, (await params).id, {
    kind: kind as never,
    title,
    organization,
    description,
    link,
  });
  return item ? Response.json({ item }, { headers: privateHeaders }) : denied(404, "Not found");
}
export async function DELETE(request: Request, { params }: Context) {
  if (!mutationAllowed(request)) return denied(403, "Invalid origin");
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  return (await deleteCareerItem(user.id, (await params).id))
    ? new Response(null, { status: 204, headers: privateHeaders })
    : denied(404, "Not found");
}
