"use client";

import { ChangeEvent, useRef, useState } from "react";
import { PdfMergeTool } from "./PdfMergeTool";
import { PdfRenameTool } from "./PdfRenameTool";
import { addUniqueFiles, isPdfFile, PdfItem } from "./pdfMergeState";

type Mode = "select" | "merge" | "rename" | "story";

export function PdfWorkbench() {
  const [mode, setMode] = useState<Mode>("select");
  const [items, setItems] = useState<PdfItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setItems(
      (current) => addUniqueFiles(current, selected.filter(isPdfFile)).items,
    );
    event.target.value = "";
  };

  return (
    <>
      <div
        className="workspace-modes"
        role="tablist"
        aria-label="PDF-Funktionen"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "select"}
          className={mode === "select" ? "is-active" : ""}
          onClick={() => setMode("select")}
        >
          Dateien auswählen
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "merge"}
          className={mode === "merge" ? "is-active" : ""}
          onClick={() => setMode("merge")}
          disabled={items.length < 2}
        >
          Verbinden
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "rename"}
          className={mode === "rename" ? "is-active" : ""}
          onClick={() => setMode("rename")}
          disabled={items.length === 0}
        >
          Umbenennen
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "story"}
          className={mode === "story" ? "is-active" : ""}
          onClick={() => setMode("story")}
        >
          About
        </button>
      </div>
      {mode === "select" && (
        <section
          className="workspace-file-selection"
          aria-labelledby="workspace-files-title"
        >
          <p className="eyebrow">Schritt 01 / Dateien</p>
          <h3 id="workspace-files-title">
            Welche PDFs möchtest du bearbeiten?
          </h3>
          <p>
            Wähle die Dateien aus. Danach entscheidest du, ob du sie verbinden
            oder umbenennen möchtest.
          </p>
          <input
            ref={inputRef}
            className="visually-hidden"
            id="workspace-pdf-files"
            type="file"
            accept="application/pdf,.pdf"
            multiple
            onChange={addFiles}
          />
          <button
            type="button"
            className="file-drop-button"
            onClick={() => inputRef.current?.click()}
          >
            <span aria-hidden="true">+</span>
            <strong>
              {items.length
                ? "Weitere PDFs auswählen"
                : "PDF-Dateien auswählen"}
            </strong>
            <small>
              {items.length
                ? `${items.length} Dateien ausgewählt`
                : "Mehrfachauswahl möglich · keine Übertragung"}
            </small>
          </button>
          {items.length > 0 && (
            <div className="workspace-selected-summary">
              <span>
                {items.length} PDF-Datei{items.length === 1 ? "" : "en"}{" "}
                ausgewählt
              </span>
              <button type="button" onClick={() => setItems([])}>
                Auswahl leeren
              </button>
            </div>
          )}
        </section>
      )}
      {mode === "merge" && <PdfMergeTool items={items} setItems={setItems} />}
      {mode === "rename" && <PdfRenameTool files={items} setFiles={setItems} />}
      {mode === "story" && (
        <section
          className="workspace-story"
          aria-labelledby="workspace-story-title"
        >
          <p className="eyebrow">PDF-Werkbank / Case Study</p>
          <h3 id="workspace-story-title">Ein Werkzeug, das nicht hochlädt.</h3>
          <p className="workspace-story-lead">
            Die PDF-Werkbank löst zwei wiederkehrende Aufgaben: Dokumente lokal
            verbinden und Dateinamen nachvollziehbar vorbereiten.
          </p>
          <dl>
            <div>
              <dt>Problem</dt>
              <dd>
                Viele PDF-Dienste verlangen für einfache Arbeitsabläufe einen
                Upload oder ein Konto.
              </dd>
            </div>
            <div>
              <dt>Entscheidung</dt>
              <dd>
                Die Verarbeitung bleibt vollständig im Browser. Inhalte,
                Dateinamen und Ergebnisse verlassen das Gerät nicht.
              </dd>
            </div>
            <div>
              <dt>Umsetzung</dt>
              <dd>
                Nach der Funktionswahl werden die Dateien ausgewählt. Verbundene
                PDFs erhalten einen frei wählbaren Downloadnamen; umbenannte
                Dateien werden in einem ZIP-Archiv gebündelt.
              </dd>
            </div>
            <div>
              <dt>Grenzen</dt>
              <dd>
                Passwortgeschützte PDFs werden nicht verarbeitet. Bei sehr
                großen Dateien entscheidet der verfügbare Arbeitsspeicher des
                Geräts.
              </dd>
            </div>
          </dl>
        </section>
      )}
    </>
  );
}
