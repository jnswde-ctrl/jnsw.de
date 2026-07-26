"use client";

import { useRef } from "react";
import { PdfMergeTool } from "./pdf-zusammenfuegen/PdfMergeTool";

export function ToolsExperience() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTool = () => dialogRef.current?.close();

  return (
    <>
      <section
        className="tools-directory"
        aria-labelledby="tools-directory-title"
      >
        <div className="tools-directory-heading">
          <p className="eyebrow">01 / Verfügbar</p>
          <p id="tools-directory-title">
            Werkzeuge, die eine konkrete Aufgabe lösen.
          </p>
        </div>
        <button
          ref={triggerRef}
          type="button"
          className="tool-row"
          onClick={() => dialogRef.current?.showModal()}
        >
          <span className="tool-index">01</span>
          <span className="tool-title">PDF zusammenfügen</span>
          <span className="tool-meta">PDF · Lokal im Browser</span>
          <span className="tool-arrow" aria-hidden="true">
            ↗
          </span>
        </button>
      </section>

      <dialog
        ref={dialogRef}
        className="tool-dialog"
        aria-labelledby="pdf-workspace-title"
        onCancel={closeTool}
        onClose={() => triggerRef.current?.focus()}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeTool();
        }}
      >
        <div className="tool-workspace">
          <header className="tool-workspace-header">
            <div>
              <p className="eyebrow">JNSW.DE / Tools / PDF</p>
              <h2 id="pdf-workspace-title">PDF zusammenfügen</h2>
            </div>
            <p className="workspace-privacy">
              <span aria-hidden="true">●</span> Verarbeitung lokal im Browser
            </p>
            <button
              type="button"
              className="workspace-close"
              onClick={closeTool}
              aria-label="PDF-Werkzeug schließen"
            >
              <span>Schließen</span>
              <b aria-hidden="true">×</b>
            </button>
          </header>
          <div className="tool-workspace-body">
            <PdfMergeTool />
          </div>
        </div>
      </dialog>
    </>
  );
}
