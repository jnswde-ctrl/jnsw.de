"use client";

import { useRef } from "react";
import { PdfWorkbench } from "./pdf-zusammenfuegen/PdfWorkbench";
import { WohnungssucheWorkbench } from "./wohnungssuche/WohnungssucheWorkbench";

export function ToolsExperience() {
  const pdfDialogRef = useRef<HTMLDialogElement>(null);
  const pdfTriggerRef = useRef<HTMLButtonElement>(null);
  const closePdfTool = () => pdfDialogRef.current?.close();

  const wohnungDialogRef = useRef<HTMLDialogElement>(null);
  const wohnungTriggerRef = useRef<HTMLButtonElement>(null);
  const closeWohnungTool = () => wohnungDialogRef.current?.close();

  return (
    <>
      <section className="tools-directory" aria-labelledby="tools-directory-title">
        <div className="tools-directory-heading">
          <p className="eyebrow">01–02 / Verfügbar</p>
          <p id="tools-directory-title">Werkzeuge, die eine konkrete Aufgabe lösen.</p>
        </div>
        <button
          ref={pdfTriggerRef}
          type="button"
          className="tool-row"
          onClick={() => pdfDialogRef.current?.showModal()}
        >
          <span className="tool-index">01</span>
          <span className="tool-title">PDF-Werkbank</span>
          <span className="tool-meta">Verbinden · umbenennen · ZIP · lokal</span>
          <span className="tool-arrow" aria-hidden="true">
            ↗
          </span>
        </button>
        <button
          ref={wohnungTriggerRef}
          type="button"
          className="tool-row"
          onClick={() => wohnungDialogRef.current?.showModal()}
        >
          <span className="tool-index">02</span>
          <span className="tool-title">Wohnungssuche-Assistent</span>
          <span className="tool-meta">Prototyp · Mock-Daten · Freigabe-Queue</span>
          <span className="tool-arrow" aria-hidden="true">
            ↗
          </span>
        </button>
      </section>
      <dialog
        ref={pdfDialogRef}
        className="tool-dialog"
        aria-labelledby="pdf-workspace-title"
        onCancel={closePdfTool}
        onClose={() => pdfTriggerRef.current?.focus()}
        onClick={(event) => {
          if (event.target === pdfDialogRef.current) closePdfTool();
        }}
      >
        <div className="tool-workspace">
          <header className="tool-workspace-header">
            <div>
              <p className="eyebrow">JNSW.DE / Tools / PDF</p>
              <h2 id="pdf-workspace-title">PDF-Werkbank</h2>
            </div>
            <p className="workspace-privacy">
              <span aria-hidden="true">●</span> Verarbeitung lokal im Browser
            </p>
            <button
              type="button"
              className="workspace-close"
              onClick={closePdfTool}
              aria-label="PDF-Werkzeug schließen"
            >
              <span>Schließen</span>
              <b aria-hidden="true">×</b>
            </button>
          </header>
          <div className="tool-workspace-body">
            <PdfWorkbench />
          </div>
        </div>
      </dialog>
      <dialog
        ref={wohnungDialogRef}
        className="tool-dialog"
        aria-labelledby="wohnung-workspace-title"
        onCancel={closeWohnungTool}
        onClose={() => wohnungTriggerRef.current?.focus()}
        onClick={(event) => {
          if (event.target === wohnungDialogRef.current) closeWohnungTool();
        }}
      >
        <div className="tool-workspace">
          <header className="tool-workspace-header">
            <div>
              <p className="eyebrow">JNSW.DE / Tools / Prototyp</p>
              <h2 id="wohnung-workspace-title">Wohnungssuche-Assistent</h2>
            </div>
            <p className="workspace-privacy">
              <span aria-hidden="true">●</span> Prototyp · Mock-Daten, kein Backend
            </p>
            <button
              type="button"
              className="workspace-close"
              onClick={closeWohnungTool}
              aria-label="Wohnungssuche-Prototyp schließen"
            >
              <span>Schließen</span>
              <b aria-hidden="true">×</b>
            </button>
          </header>
          <div className="tool-workspace-body">
            <WohnungssucheWorkbench />
          </div>
        </div>
      </dialog>
    </>
  );
}
