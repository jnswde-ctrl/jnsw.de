export type PdfSource = {
  name: string;
  arrayBuffer(): Promise<ArrayBuffer>;
};

export function pdfErrorMessage(error: unknown, fileName?: string) {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  if (/encrypted|password|encryption/i.test(message)) {
    return `${fileName ? `„${fileName}“` : "Eine Datei"} ist verschlüsselt oder passwortgeschützt und kann nicht verarbeitet werden.`;
  }
  if (/memory|allocation|array buffer|out of memory|invalid array length/i.test(message)) {
    return "Der verfügbare Arbeitsspeicher reicht für diese Dateien nicht aus. Versuche es mit kleineren oder weniger Dateien.";
  }
  if (/parse|pdf header|invalid|unexpected|missing|corrupt|object|cannot read properties|undefined.*pages/i.test(message)) {
    return `${fileName ? `„${fileName}“` : "Eine Datei"} ist beschädigt oder keine lesbare PDF-Datei.`;
  }
  return "Die PDFs konnten nicht zusammengeführt werden. Prüfe die Dateien und versuche es erneut.";
}

export async function mergePdfSources(sources: PdfSource[]) {
  const { PDFDocument } = await import("@cantoo/pdf-lib");
  const merged = await PDFDocument.create();
  for (const source of sources) {
    try {
      const document = await PDFDocument.load(await source.arrayBuffer());
      const pages = await merged.copyPages(document, document.getPageIndices());
      pages.forEach((page) => merged.addPage(page));
    } catch (error) {
      throw new Error(pdfErrorMessage(error, source.name), { cause: error });
    }
  }
  return merged.save();
}
