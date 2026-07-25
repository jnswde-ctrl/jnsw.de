"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { mergePdfSources, pdfErrorMessage } from "./mergePdf";
import { formatBytes, isPdfFile, moveItem, PdfItem, removeItem } from "./pdfMergeState";

type Status = "idle" | "processing" | "success" | "error";
type Step = 1 | 2 | 3;

const steps = [{ number: 1, label: "Auswählen" }, { number: 2, label: "Sortieren" }, { number: 3, label: "Ergebnis" }] as const;

export function PdfMergeTool() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const urlRef = useRef<string | null>(null);

  const clearResult = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setDownloadUrl(null);
  };

  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [step]);

  const resetFeedback = () => { clearResult(); setStatus("idle"); setMessage(""); };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    const valid = selected.filter(isPdfFile);
    const invalid = selected.length - valid.length;
    resetFeedback();
    setItems((current) => [...current, ...valid.map((file) => ({ id: crypto.randomUUID(), file }))]);
    if (invalid > 0) {
      setStatus("error");
      setMessage(invalid === 1 ? "Eine Datei wurde nicht hinzugefügt, weil sie keine PDF-Datei ist." : `${invalid} Dateien wurden nicht hinzugefügt, weil sie keine PDF-Dateien sind.`);
    }
    event.target.value = "";
  };

  const goTo = (nextStep: Step) => { setMessage(""); setStatus(downloadUrl ? "success" : "idle"); setStep(nextStep); };

  const merge = async () => {
    if (items.length < 2) { setStatus("error"); setMessage("Wähle mindestens zwei PDF-Dateien aus."); return; }
    clearResult(); setStatus("processing"); setMessage("PDFs werden gelesen und zusammengeführt …");
    try {
      const bytes = await mergePdfSources(items.map(({ file }) => file));
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      urlRef.current = url; setDownloadUrl(url); setStatus("success");
      setMessage(`Fertig: ${items.length} PDFs wurden erfolgreich zusammengeführt.`);
    } catch (error) {
      setStatus("error"); setMessage(error instanceof Error && error.cause ? error.message : pdfErrorMessage(error));
    }
  };

  return (
    <div className="pdf-wizard">
      <nav className="wizard-progress" aria-label="Fortschritt">
        {steps.map(({ number, label }) => (
          <button key={number} type="button" className={step === number ? "is-active" : step > number ? "is-complete" : ""} onClick={() => number < step && goTo(number)} disabled={number > step || status === "processing"} aria-current={step === number ? "step" : undefined}>
            <span>{String(number).padStart(2, "0")}</span>{label}
          </button>
        ))}
      </nav>

      <div className="wizard-panel">
        {step === 1 && (
          <section className="wizard-step" aria-labelledby="wizard-step-1">
            <p className="eyebrow">Schritt 01 / Dateien</p>
            <h3 ref={headingRef} tabIndex={-1} id="wizard-step-1">Welche PDFs möchtest du verbinden?</h3>
            <p>Wähle mindestens zwei Dateien aus. Sie bleiben auf deinem Gerät und werden nicht hochgeladen.</p>
            <input ref={inputRef} id="pdf-files" type="file" accept="application/pdf,.pdf" multiple onChange={handleFiles} />
            <button type="button" className="file-drop-button" onClick={() => inputRef.current?.click()}>
              <span aria-hidden="true">＋</span><strong>{items.length ? "Weitere PDFs auswählen" : "PDF-Dateien auswählen"}</strong><small>{items.length ? `${items.length} Dateien ausgewählt` : "Mehrfachauswahl möglich"}</small>
            </button>
            <div className="wizard-actions"><span>{items.length < 2 ? "Mindestens 2 Dateien erforderlich" : `${items.length} Dateien bereit`}</span><button type="button" className="button button-primary" onClick={() => goTo(2)} disabled={items.length < 2}>Weiter zur Reihenfolge</button></div>
          </section>
        )}

        {step === 2 && (
          <section className="wizard-step" aria-labelledby="wizard-step-2">
            <p className="eyebrow">Schritt 02 / Reihenfolge</p>
            <h3 ref={headingRef} tabIndex={-1} id="wizard-step-2">In welcher Reihenfolge?</h3>
            <p>Die Reihenfolge von oben nach unten wird in die neue PDF übernommen.</p>
            <ol className="wizard-file-list" aria-label="Ausgewählte PDF-Dateien">
              {items.map((item, index) => (
                <li key={item.id}>
                  <span className="file-position">{String(index + 1).padStart(2, "0")}</span>
                  <span className="file-name"><strong>{item.file.name}</strong><small>{formatBytes(item.file.size)}</small></span>
                  <span className="file-actions">
                    <button type="button" onClick={() => { resetFeedback(); setItems((current) => moveItem(current, index, -1)); }} disabled={index === 0} aria-label={`${item.file.name} nach oben verschieben`}>↑</button>
                    <button type="button" onClick={() => { resetFeedback(); setItems((current) => moveItem(current, index, 1)); }} disabled={index === items.length - 1} aria-label={`${item.file.name} nach unten verschieben`}>↓</button>
                    <button type="button" className="remove-file" onClick={() => { resetFeedback(); setItems((current) => removeItem(current, item.id)); }} aria-label={`${item.file.name} entfernen`}>Entfernen</button>
                  </span>
                </li>
              ))}
            </ol>
            <div className="wizard-actions wizard-actions-split"><button type="button" className="button button-secondary" onClick={() => goTo(1)}>Zurück</button><button type="button" className="button button-primary" onClick={() => goTo(3)} disabled={items.length < 2}>Reihenfolge übernehmen</button></div>
          </section>
        )}

        {step === 3 && (
          <section className="wizard-step wizard-result" aria-labelledby="wizard-step-3">
            <p className="eyebrow">Schritt 03 / Ergebnis</p>
            <h3 ref={headingRef} tabIndex={-1} id="wizard-step-3">{downloadUrl ? "Deine PDF ist bereit." : "Bereit zum Zusammenfügen."}</h3>
            <p>{items.length} PDF-Dateien werden lokal in der festgelegten Reihenfolge verarbeitet.</p>
            <div className="merge-summary"><span>{String(items.length).padStart(2, "0")}</span><div><strong>Dateien</strong><small>Keine Übertragung · keine Speicherung</small></div></div>
            <div className={`merge-status merge-status-${status}`} role={status === "error" ? "alert" : "status"} aria-live="polite" aria-busy={status === "processing"}>{status === "processing" && <span className="status-spinner" aria-hidden="true" />}<p>{message || "Starte die Verarbeitung, wenn alles passt."}</p></div>
            <div className="wizard-actions wizard-actions-split"><button type="button" className="button button-secondary" onClick={() => goTo(2)} disabled={status === "processing"}>Zurück</button>{downloadUrl ? <a className="button button-primary" href={downloadUrl} download="zusammengefuehrt.pdf">PDF herunterladen</a> : <button type="button" className="button button-primary" onClick={merge} disabled={status === "processing"}>{status === "processing" ? "Wird verarbeitet …" : "PDFs zusammenfügen"}</button>}</div>
          </section>
        )}
        {message && step !== 3 && <p className="wizard-inline-error" role="alert">{message}</p>}
      </div>
    </div>
  );
}
