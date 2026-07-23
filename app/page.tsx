export default function Home() {
  return (
    <main>
      <section className="hero" id="top">
        <nav className="nav" aria-label="Hauptnavigation">
          <a className="wordmark" href="#top">JNSW<span>.DE</span></a>
          <div><a href="mailto:hello@jnsw.de">Kontakt</a></div>
          <span className="availability"><i /> Verfügbar für ausgewählte Projekte</span>
        </nav>
        <div className="hero-grid">
          <p className="eyebrow">Independent designer &amp; developer<br />Based in Germany · Working everywhere</p>
          <h1>Digital<br />products <em>&amp;</em><br />identities<span>.</span></h1>
          <div className="hero-note"><p>Ich gestalte klare Marken und digitale Erlebnisse für Menschen, die etwas vorhaben.</p><a href="mailto:hello@jnsw.de">Projekt starten ↗</a></div>
        </div>
        <div className="hero-footer"><span>© 2026 JNSW.DE</span><span>Berlin · Germany</span><a href="mailto:hello@jnsw.de">hello@jnsw.de</a></div>
      </section>
    </main>
  );
}