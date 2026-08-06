"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const links = [
  ["Tools", "tools"],
  ["Informationen", "informationen"],
  ["Community", "community"],
];

export function SiteNav() {
  const [activeSection, setActiveSection] = useState("top");

  useEffect(() => {
    const sections = ["top", ...links.map(([, id]) => id)]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.1, 0.35, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav className="nav" aria-label="Hauptnavigation">
      <Link
        className="wordmark"
        href="/#top"
        onClick={(event) => {
          if (document.getElementById("top")) {
            event.preventDefault();
            scrollToSection("top");
          }
        }}
      >
        JNSW<span>.DE</span>
      </Link>
      <div className="nav-links">
        {links.map(([label, id]) => (
          <a
            href={`#${id}`}
            key={id}
            aria-current={activeSection === id ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              scrollToSection(id);
            }}
          >
            {label}
          </a>
        ))}
      </div>
      <span className="availability">
        <i /> Verfügbar für ausgewählte Projekte
      </span>
    </nav>
  );
}
