export type PdfItem = { id: string; file: File };

export function moveItem(items: PdfItem[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function removeItem(items: PdfItem[], id: string) {
  return items.filter((item) => item.id !== id);
}

export function isPdfFile(file: Pick<File, "name" | "type">) {
  return (
    file.type === "application/pdf" ||
    (/\.pdf$/i.test(file.name) && file.type === "")
  );
}

export function fileIdentity(
  file: Pick<File, "name" | "size" | "lastModified">,
) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

export function addUniqueFiles(
  current: PdfItem[],
  files: File[],
): { items: PdfItem[]; duplicates: number } {
  const seen = new Set(current.map(({ file }) => fileIdentity(file)));
  const additions: PdfItem[] = [];
  let duplicates = 0;

  for (const file of files) {
    const identity = fileIdentity(file);
    if (seen.has(identity)) {
      duplicates += 1;
      continue;
    }
    seen.add(identity);
    additions.push({ id: crypto.randomUUID(), file });
  }
  return { items: [...current, ...additions], duplicates };
}
export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("de-DE", { maximumFractionDigits: 1 })} MB`;
}
