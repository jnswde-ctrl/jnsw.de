"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { createZipArchive } from "./createZip";
import { formatBytes, isPdfFile, PdfItem } from "./pdfMergeState";

const today = () => new Date().toISOString().slice(0, 10);
const safeStem = (name: string) =>
  name
    .replace(/\.pdf$/i, "")
    .replace(/[\\/:*?\"<>|]/g, "-")
    .trim();
const targetName = (file: File, date: string, context: string, index: number) =>
  `${[date, context.trim(), safeStem(file.name)].filter(Boolean).join(" - ")}${index > 1 ? ` (${index})` : ""}.pdf`;

type PdfRenameToolProps = {
  files: PdfItem[];
  setFiles: React.Dispatch<React.SetStateAction<PdfItem[]>>;
};

export function PdfRenameTool({ files, setFiles }: PdfRenameToolProps) {
  const [date, setDate] = useState(today);
  const [context, setContext] = useState("");
  const [message, setMessage] = useState("");
  const [isPackaging, setIsPackaging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = useMemo(
    () =>
      files.map(({ file }, index) => ({ file, name: targetName(file, date, context, index + 1) })),
    [files, date, context],
  );
  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    const valid = selected.filter(isPdfFile);
    const known = new Set(
      files.map(({ file }) => `${file.name}-${file.size}-${file.lastModified}`),
    );
    const additions = valid.filter(
      (file) => !known.has(`${file.name}-${file.size}-${file.lastModified}`),
    );
    setFiles((current) => [
      ...current,
      ...additions.map((file) => ({ id: crypto.randomUUID(), file })),
    ]);
    setMessage(
      selected.length === valid.length ? "" : "Nicht-PDF-Dateien wurden nicht übernommen.",
    );
    event.target.value = "";
  };
  const download = async () => {
    setIsPackaging(true);
    try {
      const entries = await Promise.all(
        preview.map(async ({ file, name }) => ({
          name,
          bytes: new Uint8Array(await file.arrayBuffer()),
        })),
      );
      const url = URL.createObjectURL(
        new Blob([createZipArchive(entries)], { type: "application/zip" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "umbenannte-pdfs.zip";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(`${preview.length} umbenannte PDF-Dateien wurden als ZIP heruntergeladen.`);
    } catch {
      setMessage("Das ZIP konnte nicht erstellt werden. Bitte versuche es erneut.");
    } finally {
      setIsPackaging(false);
    }
  };
  return (
    <div className="pdf-rename-tool">
      <section className="rename-intro" aria-labelledby="rename-title">
        <p className="eyebrow">Lokale Stapelaktion</p>
        <h3 id="rename-title">PDFs nachvollziehbar benennen.</h3>
        <p>
          Datum zuerst, ein optionaler Kontext und der ursprüngliche Dateiname. Die Originaldateien
          bleiben unverändert.
        </p>
      </section>
      <input
        ref={inputRef}
        className="visually-hidden"
        id="rename-files"
        type="file"
        accept="application/pdf,.pdf"
        multiple
        onChange={addFiles}
      />
      <button type="button" className="file-drop-button" onClick={() => inputRef.current?.click()}>
        <span aria-hidden="true">+</span>
        <strong>{files.length ? "Weitere PDFs auswählen" : "PDF-Dateien auswählen"}</strong>
        <small>Mehrfachauswahl möglich · keine Übertragung</small>
      </button>
      {files.length > 0 && (
        <>
          <div className="rename-fields">
            <label>
              Datum
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
            <label>
              Kontext, optional
              <input
                value={context}
                onChange={(event) => setContext(event.target.value)}
                placeholder="z. B. Kanzlei Müller"
              />
            </label>
          </div>
          <ol className="rename-preview" aria-label="Vorschau der neuen Dateinamen">
            {preview.map(({ file, name }, index) => (
              <li key={files[index].id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{name}</strong>
                  <small>
                    aus {file.name} · {formatBytes(file.size)}
                  </small>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFiles((current) => current.filter(({ id }) => id !== files[index].id))
                  }
                  aria-label={`${file.name} entfernen`}
                >
                  Entfernen
                </button>
              </li>
            ))}
          </ol>
          <div className="wizard-actions">
            <button type="button" className="button button-secondary" onClick={() => setFiles([])}>
              Auswahl leeren
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={download}
              disabled={isPackaging}
            >
              {isPackaging ? "ZIP wird erstellt …" : "ZIP herunterladen"}
            </button>
          </div>
        </>
      )}
      {message && (
        <p className="wizard-inline-error" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
