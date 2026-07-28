"use client";

import { useRef } from "react";
import { PdfMergeTool } from "./pdf-zusammenfuegen/PdfMergeTool";

export function PdfToolLauncher({
  className = "",
  label = "Tool direkt ausprobieren",
}: {
  className?: string;
  label?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={className}
        onClick={() => dialogRef.current?.showModal()}
      >
        {label}
      </button>
      <dialog
        ref={dialogRef}
        className="tool-dialog"
        aria-labelledby="project-pdf-tool-title"
        onCancel={close}
        onClose={() => triggerRef.current?.focus()}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        <div className="tool-workspace">
          <header className="tool-workspace-header">
            <div>
              <p className="eyebrow">JNSW.DE / Tools / PDF</p>
              <h2 id="project-pdf-tool-title">PDF zusammenfügen</h2>
            </div>
            <p className="workspace-privacy">
              <span aria-hidden="true">●</span> Verarbeitung lokal im Browser
            </p>
            <button
              type="button"
              className="workspace-close"
              onClick={close}
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
