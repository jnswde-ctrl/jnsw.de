export const applicationDocumentTypes = ["cover_letter", "email", "form_response"] as const;
export type ApplicationDocumentType = (typeof applicationDocumentTypes)[number];

export const applicationDocumentStatuses = ["draft", "reviewed", "final"] as const;
export type ApplicationDocumentStatus = (typeof applicationDocumentStatuses)[number];

export const applicationDocumentTypeLabels: Record<ApplicationDocumentType, string> = {
  cover_letter: "Anschreiben",
  email: "Bewerbungs-E-Mail",
  form_response: "Formularantwort",
};

export const applicationDocumentStatusLabels: Record<ApplicationDocumentStatus, string> = {
  draft: "Entwurf",
  reviewed: "Geprüft",
  final: "Final",
};

export function isApplicationDocumentType(value: unknown): value is ApplicationDocumentType {
  return (
    typeof value === "string" && applicationDocumentTypes.includes(value as ApplicationDocumentType)
  );
}

export function isApplicationDocumentStatus(value: unknown): value is ApplicationDocumentStatus {
  return (
    typeof value === "string" &&
    applicationDocumentStatuses.includes(value as ApplicationDocumentStatus)
  );
}

export function nextDocumentVersion(latestVersion: string | null | undefined) {
  return String((Number(latestVersion ?? "0") || 0) + 1);
}

export function canFinalizeDocument(status: ApplicationDocumentStatus, confirmed: boolean) {
  return status !== "final" || confirmed;
}

export function isOwnedAttachment(
  attachment: { userId: string; applicationId: string },
  userId: string,
  applicationId: string,
) {
  return attachment.userId === userId && attachment.applicationId === applicationId;
}

export const attachmentFileTypes = {
  "application/pdf": { extension: "pdf", signature: "%PDF-" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    extension: "docx",
    signature: "PK\u0003\u0004",
  },
} as const;
export type AttachmentContentType = keyof typeof attachmentFileTypes;

export function isAttachmentContentType(value: unknown): value is AttachmentContentType {
  return typeof value === "string" && value in attachmentFileTypes;
}

export function hasValidAttachmentSignature(contentType: AttachmentContentType, bytes: Uint8Array) {
  const signature = new TextEncoder().encode(attachmentFileTypes[contentType].signature);
  return signature.every((byte, index) => bytes[index] === byte);
}
