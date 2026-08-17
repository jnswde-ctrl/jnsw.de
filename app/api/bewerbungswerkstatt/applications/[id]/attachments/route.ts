import {
  addAttachment,
  attachmentKinds,
  maxAttachmentSize,
} from "../../../../../../db/application-attachments";
import {
  hasValidAttachmentSignature,
  isAttachmentContentType,
} from "../../../../../../db/application-documents";
import { activeUser, denied, mutationAllowed, privateHeaders } from "../../../support";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  if (!mutationAllowed(request)) return denied(403, "Invalid origin");
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  const form = await request.formData().catch(() => null),
    file = form?.get("file"),
    kind = form?.get("kind");
  if (
    !(file instanceof File) ||
    !isAttachmentContentType(file.type) ||
    file.size === 0 ||
    file.size > maxAttachmentSize ||
    !attachmentKinds.includes(kind as never)
  )
    return denied(400, "Bitte lade eine PDF- oder DOCX-Datei bis 10 MB hoch.");
  const bytes = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (!hasValidAttachmentSignature(file.type, bytes))
    return denied(400, "Ungültige Dokumentdatei.");
  const attachment = await addAttachment(
    user.id,
    (await params).id,
    kind as never,
    file,
    file.type,
  );
  return attachment
    ? Response.json({ attachment }, { status: 201, headers: privateHeaders })
    : denied(404, "Not found");
}
