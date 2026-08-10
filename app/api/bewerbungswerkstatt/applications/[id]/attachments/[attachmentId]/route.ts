import { getAttachment, removeAttachment } from "../../../../../../../db/application-attachments";
import { activeUser, denied, mutationAllowed, privateHeaders } from "../../../../support";
type Context = { params: Promise<{ id: string; attachmentId: string }> };
export async function GET(_: Request, { params }: Context) {
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  const { id, attachmentId } = await params,
    result = await getAttachment(user.id, id, attachmentId);
  if (!result) return denied(404, "Not found");
  return new Response(result.object.body, {
    headers: {
      ...privateHeaders,
      "Content-Type": result.item.contentType,
      "Content-Disposition": "attachment",
      "Cache-Control": "private, no-store",
    },
  });
}
export async function DELETE(request: Request, { params }: Context) {
  if (!mutationAllowed(request)) return denied(403, "Invalid origin");
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  const { id, attachmentId } = await params;
  return (await removeAttachment(user.id, id, attachmentId))
    ? new Response(null, { status: 204, headers: privateHeaders })
    : denied(404, "Not found");
}
