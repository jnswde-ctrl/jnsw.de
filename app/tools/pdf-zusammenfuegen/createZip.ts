export type ZipEntry = { name: string; bytes: Uint8Array };

const encoder = new TextEncoder();

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
}

function writeUint32(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
  target[offset + 2] = (value >>> 16) & 0xff;
  target[offset + 3] = (value >>> 24) & 0xff;
}

/** Creates a standards-compliant ZIP archive without changing the source PDFs. */
export function createZipArchive(entries: ZipEntry[]) {
  const prepared = entries.map((entry) => ({ ...entry, nameBytes: encoder.encode(entry.name), crc: crc32(entry.bytes) }));
  const localSize = prepared.reduce((size, entry) => size + 30 + entry.nameBytes.length + entry.bytes.length, 0);
  const centralSize = prepared.reduce((size, entry) => size + 46 + entry.nameBytes.length, 0);
  const archive = new Uint8Array(localSize + centralSize + 22);
  const offsets: number[] = [];
  let offset = 0;

  for (const entry of prepared) {
    offsets.push(offset);
    writeUint32(archive, offset, 0x04034b50);
    writeUint16(archive, offset + 4, 20);
    writeUint16(archive, offset + 6, 0x0800);
    writeUint32(archive, offset + 14, entry.crc);
    writeUint32(archive, offset + 18, entry.bytes.length);
    writeUint32(archive, offset + 22, entry.bytes.length);
    writeUint16(archive, offset + 26, entry.nameBytes.length);
    archive.set(entry.nameBytes, offset + 30);
    archive.set(entry.bytes, offset + 30 + entry.nameBytes.length);
    offset += 30 + entry.nameBytes.length + entry.bytes.length;
  }

  const centralOffset = offset;
  for (const [index, entry] of prepared.entries()) {
    writeUint32(archive, offset, 0x02014b50);
    writeUint16(archive, offset + 4, 20);
    writeUint16(archive, offset + 6, 20);
    writeUint16(archive, offset + 8, 0x0800);
    writeUint32(archive, offset + 16, entry.crc);
    writeUint32(archive, offset + 20, entry.bytes.length);
    writeUint32(archive, offset + 24, entry.bytes.length);
    writeUint16(archive, offset + 28, entry.nameBytes.length);
    writeUint32(archive, offset + 42, offsets[index]);
    archive.set(entry.nameBytes, offset + 46);
    offset += 46 + entry.nameBytes.length;
  }

  writeUint32(archive, offset, 0x06054b50);
  writeUint16(archive, offset + 8, prepared.length);
  writeUint16(archive, offset + 10, prepared.length);
  writeUint32(archive, offset + 12, centralSize);
  writeUint32(archive, offset + 16, centralOffset);
  return archive;
}
