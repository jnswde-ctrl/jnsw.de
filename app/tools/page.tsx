import type { Metadata } from "next";
import { SiteNav } from "../SiteNav";

export const metadata: Metadata = {
  title: "Tools – JNSW.DE",
  description: "Kostenlose Werkzeuge für digitale Arbeit – direkt und datensparsam im Browser.",
};

export default function ToolsPage() {
  return (
    <main className="subpage">
      <section className="subpage-hero tools-hero">
        <SiteNav />
        <div className="subpage-grid">
          <p className="eyebrow">JNSW.DE / Tools<br />Werkzeuge für konkrete Aufgaben.</p>
          <h1>Werkzeuge<br />für <em>Ideen.</em><span>.</span></h1>
          <p className="subpage-intro">Kleine digitale Helfer, die lokal, verständlich und ohne unnötige Konten funktionieren.</p>
        </div>
      </section>
      <section className="content-section tool-offers" aria-labelledby="tool-offers-title">
        <p className="eyebrow">01 / Verfügbar</p>
        <div className="section-heading">
          <h2 id="tool-offers-title">Ein echtes<br /><em>Werkzeug.</em></h2>
          <p>Kein Demo-Platzhalter: Dieses Werkzeug löst eine konkrete Aufgabe direkt auf deinem Gerät.</p>
        </div>
        <a className="tool-offer-card" href="/tools/pdf-zusammenfuegen">
          <span className="eyebrow">PDF / Lokal im Browser</span>
          <div><h3>PDF<br />zusammenfügen</h3><p>Mehrere PDF-Dateien sortieren, zusammenführen und herunterladen – ohne Upload.</p></div>
          <b aria-hidden="true">→</b><span className="tool-offer-cta">Werkzeug öffnen</span>
        </a>
      </section>
      <footer className="site-footer"><span>© 2026 JNSW.DE</span><span>Berlin / Germany</span><a href="mailto:hello@jnsw.de">hello@jnsw.de</a></footer>
    </main>
  );
}
