import type { Metadata } from "next";
import { SiteNav } from "../../SiteNav";
import { PdfWorkbench } from "./PdfWorkbench";

export const metadata: Metadata = {
  title: "PDF-Werkbank: PDFs lokal bearbeiten | JNSW.DE",
  description:
    "PDF-Dateien lokal verbinden oder umbenennen und als ZIP exportieren – ohne Upload, Konto oder Serververarbeitung.",
};

export default function PdfMergePage() {
  return (
    <main className="pdf-tool-page">
      <section className="pdf-tool-hero">
        <SiteNav />
        <div className="pdf-tool-heading">
          <p className="eyebrow">JNSW.DE / Tools / PDF</p>
          <h1>
            PDF
            <br />
            <em>Werkbank.</em>
          </h1>
          <p>
            Wähle zuerst die Aufgabe: Dokumente verbinden oder Dateien einheitlich umbenennen und
            als ZIP bündeln.
          </p>
          <a className="pdf-case-link" href="/projekte/pdf-tool">
            Zur Case Study →
          </a>
        </div>
      </section>
      <section className="pdf-tool-section" aria-labelledby="pdf-tool-title">
        <div className="privacy-callout">
          <span aria-hidden="true">●</span>
          <div>
            <h2 id="pdf-tool-title">Deine Dateien bleiben bei dir.</h2>
            <p>
              <strong>
                Deine PDF-Dateien werden ausschließlich in deinem Browser verarbeitet und nicht
                hochgeladen.
              </strong>
            </p>
            <p>
              PDF-Inhalte, Dateinamen und das Ergebnis werden an keinen externen Dienst übertragen
              oder dauerhaft im Browser gespeichert.
            </p>
          </div>
        </div>
        <PdfWorkbench />
        <aside className="device-note">
          <p className="eyebrow">Hinweis zur Dateigröße</p>
          <p>
            Wie große Dateien verarbeitet werden können, hängt von deinem Gerät und dem verfügbaren
            Arbeitsspeicher ab. Es gibt deshalb kein pauschales Größenversprechen.
          </p>
        </aside>
      </section>
      <footer className="site-footer">
        <span>© 2026 JNSW.DE</span>
        <span>Alles bleibt lokal</span>
        <a href="/tools">Alle Tools</a>
      </footer>
    </main>
  );
}
