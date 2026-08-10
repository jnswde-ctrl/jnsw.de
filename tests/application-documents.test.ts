import assert from "node:assert/strict";
import test from "node:test";
import {
  canFinalizeDocument,
  hasValidAttachmentSignature,
  isApplicationDocumentStatus,
  isApplicationDocumentType,
  isAttachmentContentType,
  nextDocumentVersion,
} from "../db/application-documents";
import { isOwnedAttachment } from "../db/application-documents";

test("keeps cover letters, emails and form responses as separate document types", () => {
  assert.equal(isApplicationDocumentType("cover_letter"), true);
  assert.equal(isApplicationDocumentType("email"), true);
  assert.equal(isApplicationDocumentType("form_response"), true);
  assert.equal(isApplicationDocumentType("application"), false);
});

test("requires explicit confirmation before a document can be finalized", () => {
  assert.equal(isApplicationDocumentStatus("draft"), true);
  assert.equal(canFinalizeDocument("draft", false), true);
  assert.equal(canFinalizeDocument("final", false), false);
  assert.equal(canFinalizeDocument("final", true), true);
});

test("increments immutable document versions per document type", () => {
  assert.equal(nextDocumentVersion(undefined), "1");
  assert.equal(nextDocumentVersion("1"), "2");
  assert.equal(nextDocumentVersion("12"), "13");
});

test("accepts only signed PDF or DOCX attachment payloads", () => {
  const pdf = new TextEncoder().encode("%PDF-1.7");
  const docx = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14]);
  assert.equal(isAttachmentContentType("application/pdf"), true);
  assert.equal(
    isAttachmentContentType(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ),
    true,
  );
  assert.equal(isAttachmentContentType("text/plain"), false);
  assert.equal(hasValidAttachmentSignature("application/pdf", pdf), true);
  assert.equal(
    hasValidAttachmentSignature(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      docx,
    ),
    true,
  );
  assert.equal(hasValidAttachmentSignature("application/pdf", docx), false);
});

test("does not expose a private attachment across users or applications", () => {
  const attachment = { userId: "user-a", applicationId: "application-a" };
  assert.equal(isOwnedAttachment(attachment, "user-a", "application-a"), true);
  assert.equal(isOwnedAttachment(attachment, "user-b", "application-a"), false);
  assert.equal(isOwnedAttachment(attachment, "user-a", "application-b"), false);
});
