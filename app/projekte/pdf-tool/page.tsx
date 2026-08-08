import type { Metadata } from "next";
import { SiteNav } from "../../SiteNav";
import { PdfToolLauncher } from "../../tools/PdfToolLauncher";

export const metadata: Metadata = {
  title: "PDF-Werkbank: Case Study | JNSW.DE",
  description:
    "Die Case Study zur PDF-Werkbank erklärt, wie ein lokales PDF-Tool ohne Upload, Konto und Serververarbeitung entsteht.",
};

const parts = [
  [
    "Problem",
    "Viele PDF-Dienste verlangen für das Zusammenführen oder Aufbereiten von Dateien einen Upload oder ein Konto.",
  ],
  [
    "Datenschutzentscheidung",
    "Die Verarbeitung findet ausschließlich lokal im Browser statt. Inhalte, Dateinamen, ZIP-Archive und Ergebnisse verlassen das Gerät nicht.",
  ],
  [
    "Technische Umsetzung",
    "Die Werkbank beginnt mit einer Funktionswahl: PDFs verbinden oder umbenennen. Beim Verbinden wird die Reihenfolge festgelegt und ein Downloadname vergeben; beim Umbenennen bündelt ein ZIP-Archiv die Dateien mit ihren neuen Namen.",
  ],
  [
    "Grenzen",
    "Passwortgeschützte PDFs funktionieren nicht. Bei sehr großen Dateien entscheidet der verfügbare Arbeitsspeicher des Geräts.",
  ],
];

export default function PdfToolCaseStudy() {
  return (
    <main className="case-study">
      <section className="case-study-hero">
        <SiteNav />
        <div className="case-study-grid">
          <p className="eyebrow">JNSW.DE / PROJEKTE / 01</p>
          <h1>
            Eine PDF-Werkbank,
            <br />
            das <em>nicht</em> hochlädt.
          </h1>
          <div className="case-study-intro">
            <p>Case Study · Produkt, Datenschutz und Umsetzung</p>
            <PdfToolLauncher className="button button-primary" label="Tool ausprobieren →" />
          </div>
        </div>
      </section>
      <section className="case-study-body">
        <p className="eyebrow">ENTSCHEIDUNGEN SICHTBAR MACHEN</p>
        <div className="case-study-summary">
          <p>
            Ein kleines Werkzeug ist dann gut, wenn es eine konkrete Aufgabe zuverlässig erledigt
            und seine Versprechen verständlich macht.
          </p>
          <dl>
            <div>
              <dt>Verarbeitung</dt>
              <dd>Lokal im Browser</dd>
            </div>
            <div>
              <dt>Übertragung</dt>
              <dd>Keine</dd>
            </div>
          </dl>
        </div>
        <div className="case-study-sections">
          {parts.map(([title, text], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{title}</h2>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <footer className="site-footer">
        <span>© 2026 JNSW.DE</span>
        <span>Case Study 01</span>
        <PdfToolLauncher className="button" label="PDF-Werkbank öffnen" />
      </footer>
    </main>
  );
}
