import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument } from "@cantoo/pdf-lib";
import { mergePdfSources } from "../app/tools/pdf-zusammenfuegen/mergePdf.ts";

test("merging PDF data performs no fetch requests", async () => {
  const document = await PDFDocument.create();
  document.addPage();
  const bytes = await document.save();
  let fetchCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error("Network access is forbidden during PDF processing");
  };

  try {
    const makeSource = (name: string) => ({
      name,
      async arrayBuffer() {
        return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      },
    });
    const result = await mergePdfSources([makeSource("eins.pdf"), makeSource("zwei.pdf")]);
    assert.equal((await PDFDocument.load(result)).getPageCount(), 2);
    assert.equal(fetchCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
