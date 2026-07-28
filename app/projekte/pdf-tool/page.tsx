import Link from "next/link";
import { SiteNav } from "../../SiteNav";

const parts = [
  ["Problem", "Mehrere PDFs zusammenzuführen ist häufig nötig. Viele bestehende Dienste verlangen dafür jedoch einen Upload, ein Konto oder lassen die Aufbewahrung der Dateien offen."],
  ["Datenschutzentscheidung", "Die Verarbeitung findet ausschließlich lokal im Browser statt. PDF-Inhalte, Dateinamen und Ergebnis werden nicht an einen Server oder externen Dienst übertragen."],
  ["Technische Umsetzung", "Die Dateien verbleiben im Arbeitsspeicher. Eine PDF-Bibliothek kopiert ihre Seiten in der gewählten Reihenfolge und erzeugt einen temporären Download. Dabei gibt es keine Netzwerkanfragen."],
  ["Robustheit", "Mindestens zwei Dateien sind erforderlich, doppelte Auswahl wird verhindert und die Reihenfolge ist per Tastatur, Maus und Touch änderbar. Beschädigte oder verschlüsselte PDFs erhalten konkrete Fehlermeldungen."],
  ["Grenzen", "Passwortgeschützte PDFs funktionieren nicht. Sehr große Dateien können den Arbeitsspeicher des jeweiligen Geräts überfordern. Das Tool komprimiert oder prüft keine Inhalte."],
  ["Nächste Schritte", "Drag-and-drop-Sortierung und eine Seitenanzahl vor dem Zusammenführen sind sinnvolle nächste Ausbaustufen – ohne die lokale Verarbeitung aufzugeben."],
];

export default function PdfToolCaseStudy() {
  return <main className="case-study"><section className="case-study-hero"><SiteNav /><div className="case-study-grid"><p className="eyebrow">JNSW.DE / PROJEKTE / 01</p><h1>Ein PDF-Tool,<br />das <em>nicht</em> hochlädt.</h1><div className="case-study-intro"><p>Case Study · Produkt, Datenschutz und Umsetzung</p><Link href="/tools/pdf-zusammenfuegen">Tool ausprobieren →</Link></div></div></section><section className="case-study-body"><p className="eyebrow">ENTSCHEIDUNGEN SICHTBAR MACHEN</p><div className="case-study-summary"><p>Ein kleines Werkzeug ist dann gut, wenn es eine konkrete Aufgabe zuverlässig erledigt und seine Versprechen verständlich macht.</p><dl><div><dt>Verarbeitung</dt><dd>Lokal im Browser</dd></div><div><dt>Übertragung</dt><dd>Keine</dd></div></dl></div><div className="case-study-sections">{parts.map(([title,text], index) => <article key={title}><span>{String(index + 1).padStart(2,"0")}</span><div><h2>{title}</h2><p>{text}</p></div></article>)}</div></section><footer className="site-footer"><span>© 2026 JNSW.DE</span><span>Case Study 01</span><Link href="/tools/pdf-zusammenfuegen">PDF-Tool öffnen</Link></footer></main>;
}
