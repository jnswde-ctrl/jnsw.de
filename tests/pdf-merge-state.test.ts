import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument, StandardFonts } from "@cantoo/pdf-lib";
import { mergePdfSources, pdfErrorMessage } from "../app/tools/pdf-zusammenfuegen/mergePdf.ts";
import { isPdfFile, moveItem, removeItem } from "../app/tools/pdf-zusammenfuegen/pdfMergeState.ts";

const fakeFile = (name: string, type = "application/pdf") => ({ name, type }) as File;
const item = (id: string) => ({ id, file: fakeFile(`${id}.pdf`) });

test("accepts PDFs and rejects unrelated file types", () => {
  assert.equal(isPdfFile(fakeFile("eins.pdf")), true);
  assert.equal(isPdfFile(fakeFile("zwei.PDF", "")), true);
  assert.equal(isPdfFile(fakeFile("notiz.txt", "text/plain")), false);
  assert.equal(isPdfFile(fakeFile("fake.pdf", "text/plain")), false);
});

test("moves selected files without mutating the original list", () => {
  const original = [item("a"), item("b"), item("c")];
  assert.deepEqual(
    moveItem(original, 1, -1).map(({ id }) => id),
    ["b", "a", "c"],
  );
  assert.deepEqual(
    moveItem(original, 1, 1).map(({ id }) => id),
    ["a", "c", "b"],
  );
  assert.deepEqual(
    original.map(({ id }) => id),
    ["a", "b", "c"],
  );
});

test("keeps boundary items in place", () => {
  const original = [item("a"), item("b")];
  assert.equal(moveItem(original, 0, -1), original);
  assert.equal(moveItem(original, 1, 1), original);
});

test("removes only the selected file", () => {
  assert.deepEqual(
    removeItem([item("a"), item("b"), item("c")], "b").map(({ id }) => id),
    ["a", "c"],
  );
});

async function createPdf(label: string, pages: number, password?: string) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  for (let index = 0; index < pages; index += 1) {
    const page = document.addPage();
    page.drawText(`${label}-${index + 1}`, { x: 40, y: 700, font });
  }
  if (password)
    document.encrypt({
      userPassword: password,
      ownerPassword: `${password}-owner`,
    });
  return document.save();
}

const source = (name: string, bytes: Uint8Array) => ({
  name,
  async arrayBuffer() {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  },
});

test("merges all pages from source PDFs in supplied order", async () => {
  const first = await createPdf("FIRST", 1);
  const second = await createPdf("SECOND", 2);
  const result = await mergePdfSources([source("first.pdf", first), source("second.pdf", second)]);
  assert.equal((await PDFDocument.load(result)).getPageCount(), 3);

  const reversed = await mergePdfSources([
    source("second.pdf", second),
    source("first.pdf", first),
  ]);
  assert.equal((await PDFDocument.load(reversed)).getPageCount(), 3);
  assert.notDeepEqual(result, reversed);
});

test("reports a damaged PDF and remains callable afterwards", async () => {
  await assert.rejects(
    mergePdfSources([source("kaputt.pdf", new TextEncoder().encode("%PDF-1.7\nkaputt"))]),
    /kaputt\.pdf.*beschädigt|kaputt\.pdf.*lesbare PDF/,
  );
  const valid = await createPdf("RECOVERY", 1);
  const recovered = await mergePdfSources([source("one.pdf", valid), source("two.pdf", valid)]);
  assert.equal((await PDFDocument.load(recovered)).getPageCount(), 2);
});

test("reports password-protected PDFs clearly", async () => {
  const encrypted = await createPdf("SECRET", 1, "geheim");
  await assert.rejects(
    mergePdfSources([source("geschuetzt.pdf", encrypted)]),
    /geschuetzt\.pdf.*verschlüsselt|geschuetzt\.pdf.*passwortgeschützt/,
  );
});

test("maps browser memory failures to actionable guidance", () => {
  assert.match(pdfErrorMessage(new RangeError("Invalid array length")), /Arbeitsspeicher/);
});
