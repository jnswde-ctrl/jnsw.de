import type { Metadata } from "next";
import { SiteNav } from "../SiteNav";
import { ToolsExperience } from "./ToolsExperience";

export const metadata: Metadata = {
  title: "Digitale Tools für klare Aufgaben | JNSW.DE",
  description:
    "Kostenlose, datensparsame Werkzeuge für konkrete digitale Aufgaben – direkt im Browser und ohne unnötige Konten.",
};

export default function ToolsPage() {
  return (
    <main className="tools-page">
      <SiteNav />
      <div className="tools-intro">
        <p className="eyebrow">
          JNSW.DE / Tools
          <br />
          Werkzeuge für konkrete Aufgaben.
        </p>
        <h1>
          Werkzeuge
          <br />
          für <em>Ideen.</em>
          <span>.</span>
        </h1>
        <p className="tools-lead">
          Kleine digitale Helfer, die lokal, verständlich und ohne unnötige Konten funktionieren.
        </p>
      </div>
      <ToolsExperience />
    </main>
  );
}
