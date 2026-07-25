"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { mergePdfSources, pdfErrorMessage } from "./mergePdf";
import { formatBytes, isPdfFile, moveItem, PdfItem, removeItem } from "./pdfMergeState";

type Status = "idle" | "processing" | "success" | "error";

export function PdfMergeTool() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);

  const clearResult = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setDownloadUrl(null);
  };

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  const resetFeedback = () => {
    clearResult();
    setStatus("idle");
    setMessage("");
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    const valid = selected.filter(isPdfFile);
    const invalid = selected.length - valid.length;
    resetFeedback();
    setItems((current) => [...current, ...valid.map((file) => ({ id: crypto.randomUUID(), file }))]);
    if (invalid > 0) {
      setStatus("error");
      setMessage(invalid === 1
        ? "Eine Datei wurde nicht hinzugefügt, weil sie keine PDF-Datei ist."
        : `${invalid} Dateien wurden nicht hinzugefügt, weil sie keine PDF-Dateien sind.`);
    }
    event.target.value = "";
  };

  const merge = async () => {
    if (items.length < 2) {
      setStatus("error");
      setMessage("Wähle mindestens zwei PDF-Dateien aus.");
      return;
    }
    clearResult();
    setStatus("processing");
    setMessage("PDFs werden gelesen und zusammengeführt …");
    try {
      const bytes = await mergePdfSources(items.map(({ file }) => file));

      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      urlRef.current = url;
      setDownloadUrl(url);
      setStatus("success");
      setMessage(`Fertig: ${items.length} PDFs wurden erfolgreich zusammengeführt.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error && error.cause ? error.message : pdfErrorMessage(error));
    }
  };

  return (
    <div className="pdf-merger">
      <div className="file-picker">
        <input ref={inputRef} id="pdf-files" type="file" accept="application/pdf,.pdf" multiple onChange={handleFiles} disabled={status === "processing"} />
        <div><p className="eyebrow">Schritt 01 / Dateien</p><h2>PDFs auswählen</h2><p>Wähle zwei oder mehr lokale PDF-Dateien. Du kannst später weitere hinzufügen.</p></div>
        <button type="button" className="button button-secondary" onClick={() => inputRef.current?.click()} disabled={status === "processing"}>Dateien auswählen</button>
      </div>

      {items.length > 0 && (
        <div className="file-order">
          <div className="file-order-heading"><div><p className="eyebrow">Schritt 02 / Reihenfolge</p><h2>Dateien sortieren</h2></div><span>{items.length} {items.length === 1 ? "Datei" : "Dateien"}</span></div>
          <ol aria-label="Ausgewählte PDF-Dateien">
            {items.map((item, index) => (
              <li key={item.id}>
                <span className="file-position" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="file-name"><strong>{item.file.name}</strong><small>{formatBytes(item.file.size)}</small></span>
                <span className="file-actions">
                  <button type="button" onClick={() => { resetFeedback(); setItems((current) => moveItem(current, index, -1)); }} disabled={index === 0 || status === "processing"} aria-label={`${item.file.name} nach oben verschieben`}>↑</button>
                  <button type="button" onClick={() => { resetFeedback(); setItems((current) => moveItem(current, index, 1)); }} disabled={index === items.length - 1 || status === "processing"} aria-label={`${item.file.name} nach unten verschieben`}>↓</button>
                  <button type="button" className="remove-file" onClick={() => { resetFeedback(); setItems((current) => removeItem(current, item.id)); }} disabled={status === "processing"} aria-label={`${item.file.name} entfernen`}>Entfernen</button>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="merge-actions">
        <div><p className="eyebrow">Schritt 03 / Zusammenführen</p><p>Die sichtbare Reihenfolge wird in die Ergebnisdatei übernommen.</p></div>
        <button type="button" className="button button-primary" onClick={merge} disabled={status === "processing"}>{status === "processing" ? "Wird verarbeitet …" : "PDFs zusammenführen"}</button>
      </div>
      <div className={`merge-status merge-status-${status}`} role={status === "error" ? "alert" : "status"} aria-live="polite" aria-busy={status === "processing"}>
        {status === "processing" && <span className="status-spinner" aria-hidden="true" />}
        <p>{message || "Bereit. Deine Dateien werden erst nach deinem Klick verarbeitet."}</p>
        {downloadUrl && <a className="button button-download" href={downloadUrl} download="zusammengefuehrt.pdf">zusammengefuehrt.pdf herunterladen</a>}
      </div>
    </div>
  );
}
