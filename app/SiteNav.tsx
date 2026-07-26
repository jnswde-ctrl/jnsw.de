import Link from "next/link";

const links = [
  ["Tools", "/tools"],
  ["Informationen", "/informationen"],
  ["Community", "/community"],
];

export function SiteNav() {
  return (
    <nav className="nav" aria-label="Hauptnavigation">
      <Link className="wordmark" href="/">
        JNSW<span>.DE</span>
      </Link>
      <div className="nav-links">
        {links.map(([label, href]) => (
          <Link href={href} key={href}>
            {label}
          </Link>
        ))}
        <a href="mailto:hello@jnsw.de">Kontakt</a>
      </div>
      <span className="availability">
        <i /> Verfügbar für ausgewählte Projekte
      </span>
    </nav>
  );
}
