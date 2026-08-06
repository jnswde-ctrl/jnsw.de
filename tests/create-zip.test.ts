import assert from "node:assert/strict";
import test from "node:test";
import { createZipArchive } from "../app/tools/pdf-zusammenfuegen/createZip.ts";

const read32 = (bytes: Uint8Array, offset: number) =>
  (bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)) >>>
  0;

test("creates a ZIP archive containing the renamed PDFs", () => {
  const archive = createZipArchive([
    { name: "2026 - Angebot.pdf", bytes: new TextEncoder().encode("first") },
    { name: "2026 - Rechnung.pdf", bytes: new TextEncoder().encode("second") },
  ]);
  assert.equal(read32(archive, 0), 0x04034b50);
  assert.equal(read32(archive, archive.length - 22), 0x06054b50);
  assert.equal(new TextDecoder().decode(archive).includes("2026 - Angebot.pdf"), true);
  assert.equal(new TextDecoder().decode(archive).includes("2026 - Rechnung.pdf"), true);
});
