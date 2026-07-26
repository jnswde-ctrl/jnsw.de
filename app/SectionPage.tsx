import { SiteNav } from "./SiteNav";

export function SectionPage({
  label,
  title,
  intro,
}: {
  label: string;
  title: React.ReactNode;
  intro: string;
}) {
  return (
    <main className="subpage">
      <section className="subpage-hero">
        <SiteNav />
        <div className="subpage-grid">
          <p className="eyebrow">
            JNSW.DE / {label}
            <br />
            Eine offene Sammlung fuer digitale Arbeit.
          </p>
          <h1>
            {title}
            <span>.</span>
          </h1>
          <p className="subpage-intro">{intro}</p>
        </div>
        <div className="orbit" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <footer className="subpage-footer">
          <span>(c) 2026 JNSW.DE</span>
          <span>Berlin / Germany</span>
          <a href="mailto:hello@jnsw.de">hello@jnsw.de</a>
        </footer>
      </section>
    </main>
  );
}
