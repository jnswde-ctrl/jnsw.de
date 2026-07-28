import { SiteNav } from "./SiteNav";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="hero" id="top">
        <SiteNav />
        <div className="hero-grid">
          <p className="eyebrow">
            JNSW.DE / Digitale Produkte
            <br />
            Entwicklung und Dokumentation aus Deutschland
          </p>
          <h1>
            Kleine Produkte.
            <br />
            Klar <em>gemacht.</em><span>.</span>
          </h1>
          <div className="hero-note">
            <p>
              JNSW.DE entwickelt nützliche digitale Werkzeuge und dokumentiert
              die Entscheidungen dahinter.
            </p>
            <a href="mailto:hello@jnsw.de">Projekt starten -&gt;</a>
          </div>
        </div>
        <div className="hero-footer">
          <span>(c) 2026 JNSW.DE</span>
          <span>Berlin / Germany</span>
          <a href="mailto:hello@jnsw.de">hello@jnsw.de</a>
        </div>
      </section>
      <section className="section work" id="ueber" aria-labelledby="projects-title">
        <div className="section-intro">
          <p className="eyebrow">01 / Projekte</p>
          <p id="projects-title">
            Arbeit, bei der Entscheidungen und Umsetzung nachvollziehbar
            bleiben.
          </p>
        </div>
        <div className="projects">
          <Link className="project green" href="/projekte/pdf-tool">
            <span className="project-art" aria-hidden="true"><i className="shape-a" /><i className="shape-b" /></span>
            <span className="project-meta"><span>Case Study 01</span><span>2026</span></span>
            <span className="project-name"><h2>PDF-Tool</h2><span aria-hidden="true">→</span></span>
          </Link>
          <Link className="project blue" href="/tools/pdf-zusammenfuegen">
            <span className="project-art" aria-hidden="true"><i className="shape-a" /><i className="shape-b" /></span>
            <span className="project-meta"><span>Werkzeug 01</span><span>Lokal</span></span>
            <span className="project-name"><h2>PDF zusammenfügen</h2><span aria-hidden="true">→</span></span>
          </Link>
        </div>
      </section>
    </main>
  );
}
