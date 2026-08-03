import { requireAppUser } from "./auth";
import { CommunityAccount } from "./community/CommunityAccount";
import { SiteNav } from "./SiteNav";
import { ToolsExperience } from "./tools/ToolsExperience";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireAppUser();

  return (
    <main className="scroll-platform">
      <header className="site-header"><SiteNav /></header>
      <section className="hero" id="top">
        <div className="hero-grid">
          <p className="eyebrow">JNSW.DE / Digitale Produkte<br />Entwicklung und Dokumentation aus Deutschland</p>
          <h1>Kleine Produkte.<br />Klar <em>gemacht.</em><span>.</span></h1>
          <div className="hero-note"><p>JNSW.DE entwickelt nützliche digitale Werkzeuge und dokumentiert die Entscheidungen dahinter.</p><a href="#projekte">Entdecken →</a></div>
        </div>
        <div className="hero-footer"><span>© 2026 JNSW.DE</span><span>Berlin / Germany</span><a href="mailto:hello@jnsw.de">hello@jnsw.de</a></div>
      </section>

      <section className="section work platform-section" id="projekte" aria-labelledby="projects-title">
        <div className="section-intro"><p className="eyebrow">01 / Projekte</p><p id="projects-title">Arbeit, bei der Entscheidungen und Umsetzung nachvollziehbar bleiben.</p></div>
        <div className="projects">
          <a className="project green" href="#tools"><span className="project-art" aria-hidden="true"><i className="shape-a" /><i className="shape-b" /></span><span className="project-meta"><span>Case Study 01</span><span>2026</span></span><span className="project-name"><h2>PDF-Tool</h2><span aria-hidden="true">→</span></span></a>
          <a className="project blue" href="#tools"><span className="project-art" aria-hidden="true"><i className="shape-a" /><i className="shape-b" /></span><span className="project-meta"><span>Werkzeug 01</span><span>Lokal</span></span><span className="project-name"><h2>PDF zusammenfügen</h2><span aria-hidden="true">→</span></span></a>
        </div>
      </section>

      <section className="platform-section platform-tools" id="tools" aria-labelledby="tools-title">
        <div className="platform-heading"><p className="eyebrow">02 / Tools</p><div><h2 id="tools-title">Werkzeuge, die <em>einfach</em> bleiben.</h2><p>Für klare Aufgaben, lokal im Browser und ohne unnötige Umwege.</p></div></div>
        <ToolsExperience />
      </section>

      <section className="platform-section platform-information" id="informationen" aria-labelledby="information-title">
        <div className="platform-heading"><p className="eyebrow">03 / Informationen</p><div><h2 id="information-title">Was wir bauen, <em>verständlich</em> machen.</h2><p>Notizen und Entscheidungen zu digitalen Produkten, Werkzeugen und ihrer Umsetzung folgen hier als offene Dokumentation.</p></div></div>
      </section>

      <section className="platform-section community-section" id="community" aria-label="Community"><CommunityAccount initialUser={user ? { displayName: user.displayName, status: user.status } : null} /></section>
      <footer className="site-footer platform-footer"><span>© 2026 JNSW.DE</span><span>Produkte, Werkzeuge, Informationen</span><a href="mailto:hello@jnsw.de">hello@jnsw.de</a></footer>
    </main>
  );
}
