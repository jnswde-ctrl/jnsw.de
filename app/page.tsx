import { SiteNav } from "./SiteNav";

export default function Home() {
  return (
    <main>
      <section className="hero" id="top">
        <SiteNav />
        <div className="hero-grid">
          <p className="eyebrow">
            Independent designer &amp; developer
            <br />
            Based in Germany / Working everywhere
          </p>
          <h1>
            Digital
            <br />
            products <em>&amp;</em>
            <br />
            identities<span>.</span>
          </h1>
          <div className="hero-note">
            <p>
              Ich gestalte klare Marken und digitale Erlebnisse fuer Menschen,
              die etwas vorhaben.
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
    </main>
  );
}
