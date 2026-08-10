"use client";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { applicationStatusLabels } from "../../../db/workflow";
type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  deadlineAt: string | null;
  followUpAt: string | null;
};
type Item = { id: string; kind: string; title: string; organization: string | null };
type Suggestion = {
  company: string;
  role: string;
  jobUrl: string | null;
  salary: string | null;
  deadlineAt: string | null;
  notes: string;
};
type LegacyImportPayload = {
  applications: Array<Record<string, unknown>>;
  unlinkedLetters: number;
};
type LegacyImportReport = {
  new: number;
  updated: number;
  skipped: number;
  conflicts: number;
  privateReferences: number;
  unlinkedLetters: number;
};
type ProfileSkill = { id: string; name: string; kind: "experience" | "learning"; level: string };
async function request(path: string, options?: RequestInit) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? "Bitte erneut versuchen.");
  return data;
}
export function Bewerbungswerkstatt() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [skills, setSkills] = useState<ProfileSkill[]>([]);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"overview" | "application" | "profile">("overview");
  const [source, setSource] = useState("");
  const [mode, setMode] = useState<"url" | "text">("url");
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [legacyPayload, setLegacyPayload] = useState<LegacyImportPayload | null>(null);
  const [legacyReport, setLegacyReport] = useState<LegacyImportReport | null>(null);
  const [legacyFileName, setLegacyFileName] = useState("");
  const legacyApplicationsFile = useRef<HTMLInputElement>(null);
  async function load() {
    try {
      const [a, p, s] = await Promise.all([
        request("/api/bewerbungswerkstatt/applications"),
        request("/api/bewerbungswerkstatt/profile"),
        request("/api/bewerbungswerkstatt/skills"),
      ]);
      setApplications(a.applications);
      setItems(p.items);
      setSkills(s.skills);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Laden fehlgeschlagen.");
    }
  }
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>, path: string, success: string) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await request(path, {
        method: "POST",
        body: JSON.stringify({
          ...Object.fromEntries(new FormData(form)),
          ...(path.endsWith("/skills")
            ? { careerItemIds: new FormData(form).getAll("careerItemIds") }
            : {}),
        }),
      });
      form.reset();
      setMessage(success);
      await load();
      setStep("overview");
      setSuggestion(null);
      setSource("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Speichern fehlgeschlagen.");
    }
  }
  async function importJob(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const result = await request("/api/bewerbungswerkstatt/import", {
        method: "POST",
        body: JSON.stringify(mode === "url" ? { url: source } : { text: source }),
      });
      setSuggestion(result.suggestion);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }
  async function selectLegacyFiles(applicationFile?: File, lettersFile?: File) {
    if (!applicationFile) return;
    setMessage("");
    setLegacyReport(null);
    if (applicationFile.size > 512_000 || (lettersFile && lettersFile.size > 128_000)) {
      setMessage("Die ausgewählten Dateien sind für den lokalen Import zu groß.");
      return;
    }
    try {
      const source = JSON.parse(await applicationFile.text()) as { applications?: unknown };
      if (!Array.isArray(source.applications))
        throw new Error("bewerbungen.json enthält keine Liste von Bewerbungen.");
      let unlinkedLetters = 0;
      if (lettersFile) {
        const letters = JSON.parse(await lettersFile.text()) as { jobs?: unknown };
        if (!Array.isArray(letters.jobs))
          throw new Error("anschreiben_jobs.json enthält keine Liste von Anschreiben.");
        unlinkedLetters = letters.jobs.length;
      }
      const applications = source.applications.map((item) => {
        if (!item || typeof item !== "object")
          throw new Error("Eine Bewerbung hat ein ungültiges Format.");
        const record = item as Record<string, unknown>;
        return {
          id: record.id,
          company: record.company,
          role: record.role,
          sourceUrl: record.sourceUrl,
          reviewedAt: record.reviewedAt,
          appliedAt: record.appliedAt,
          status: record.status,
          notes: record.notes,
          statusUpdatedAt: record.statusUpdatedAt,
          privateReferenceCount:
            (Array.isArray(record.documents) ? record.documents.length : 0) +
            (Array.isArray(record.evidenceDocuments) ? record.evidenceDocuments.length : 0),
        };
      });
      setLegacyPayload({ applications, unlinkedLetters });
      setLegacyFileName(applicationFile.name);
    } catch (error) {
      setLegacyPayload(null);
      setMessage(error instanceof Error ? error.message : "Datei konnte nicht gelesen werden.");
    }
  }
  async function previewLegacyImport() {
    if (!legacyPayload) return;
    setLoading(true);
    setMessage("");
    try {
      const result = await request("/api/bewerbungswerkstatt/legacy-import", {
        method: "POST",
        body: JSON.stringify({ ...legacyPayload, mode: "dry-run" }),
      });
      setLegacyReport(result.report);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Probelauf fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }
  async function applyLegacyImport() {
    if (!legacyPayload || !legacyReport) return;
    setLoading(true);
    setMessage("");
    try {
      const result = await request("/api/bewerbungswerkstatt/legacy-import", {
        method: "POST",
        body: JSON.stringify({ ...legacyPayload, mode: "apply" }),
      });
      setLegacyReport(result.report);
      setLegacyPayload(null);
      setMessage("Altbestand importiert.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="workbench">
      <header className="workbench-head">
        <Link href="/community" className="workbench-back">
          ← Community
        </Link>
        <div>
          <p className="eyebrow">Private Arbeitsfläche</p>
          <h1>
            Bewerbungs
            <wbr />
            werkstatt<span>.</span>
          </h1>
        </div>
        <p>
          Deine Daten sind nur für dich sichtbar. Speichere nur Angaben, die für deine Bewerbung
          erforderlich sind.
        </p>
      </header>
      <nav className="workbench-steps" aria-label="Arbeitsbereiche">
        {(["overview", "application", "profile"] as const).map((name, index) => (
          <button
            key={name}
            onClick={() => setStep(name)}
            aria-current={step === name ? "step" : undefined}
          >
            <b>0{index + 1}</b>
            {name === "overview" ? "Übersicht" : name === "application" ? "Bewerbung" : "Profil"}
          </button>
        ))}
      </nav>
      {message && (
        <p role="status" className="workbench-message">
          {message}
        </p>
      )}
      {step === "overview" && (
        <section className="workbench-grid">
          <div>
            <p className="eyebrow">Pipeline</p>
            <h2>Deine Bewerbungen</h2>
            <div className="application-list">
              {applications.length ? (
                applications.map((app) => (
                  <article key={app.id}>
                    <div>
                      <Link href={`/community/bewerbungswerkstatt/${app.id}`}>
                        <b>{app.role}</b>
                        <span>
                          {app.company} ·{" "}
                          {applicationStatusLabels[
                            app.status as keyof typeof applicationStatusLabels
                          ] ?? app.status}
                        </span>
                      </Link>
                      {app.deadlineAt && <small>Frist: {app.deadlineAt}</small>}
                    </div>
                  </article>
                ))
              ) : (
                <p>Noch keine Bewerbung angelegt.</p>
              )}
            </div>
          </div>
          <aside>
            <p className="eyebrow">Nächste Schritte</p>
            <h2>{applications.filter((app) => app.followUpAt).length} Follow-ups</h2>
            <p>Fristen und Follow-ups bleiben pro Bewerbung dokumentiert.</p>
            <div className="legacy-import">
              <p className="eyebrow">Altbestand</p>
              <h3>Bewerbungen übernehmen.</h3>
              <p>
                Die JSON-Dateien werden zuerst nur in diesem Browser gelesen. Dokumentnamen und
                Anschreiben werden nicht hochgeladen.
              </p>
              <label>
                bewerbungen.json
                <input
                  ref={legacyApplicationsFile}
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) =>
                    void selectLegacyFiles(event.currentTarget.files?.[0], undefined)
                  }
                />
              </label>
              <label>
                anschreiben_jobs.json <small>(optional, nur für den Bericht)</small>
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => {
                    void selectLegacyFiles(
                      legacyApplicationsFile.current?.files?.[0],
                      event.currentTarget.files?.[0],
                    );
                  }}
                />
              </label>
              {legacyPayload && <p>{legacyFileName} bereit. Erst Probelauf starten.</p>}
              <button
                type="button"
                className="community-button"
                disabled={!legacyPayload || loading}
                onClick={() => void previewLegacyImport()}
              >
                {loading ? "Wird geprüft …" : "Probelauf"}
              </button>
              {legacyReport && (
                <div className="legacy-report" role="status">
                  <p>
                    {legacyReport.new} neu, {legacyReport.updated} ergänzbar, {legacyReport.skipped}{" "}
                    unverändert, {legacyReport.conflicts} Konflikte.
                  </p>
                  <p>
                    {legacyReport.privateReferences} private Dokumentreferenzen und{" "}
                    {legacyReport.unlinkedLetters} Anschreiben werden nicht übernommen.
                  </p>
                  <button
                    type="button"
                    className="community-button"
                    disabled={loading || legacyReport.conflicts > 0}
                    onClick={() => void applyLegacyImport()}
                  >
                    Jetzt {legacyReport.new + legacyReport.updated} Einträge übernehmen
                  </button>
                </div>
              )}
            </div>
          </aside>
        </section>
      )}
      {step === "application" && (
        <section className="workbench-form">
          <p className="eyebrow">Neue Bewerbung</p>
          <h2>Stelle importieren.</h2>
          <p className="workbench-intro">
            Lies eine öffentlich erreichbare Anzeige oder füge ihren Text ein. Die KI-Ausgabe ist
            ein Vorschlag: Prüfe und korrigiere alle Felder, bevor du speicherst. Der Originalinhalt
            wird nicht gespeichert.
          </p>
          <form className="job-import-form" onSubmit={(event) => void importJob(event)}>
            <div className="import-tabs" role="group" aria-label="Importquelle">
              <button type="button" aria-pressed={mode === "url"} onClick={() => setMode("url")}>
                URL lesen
              </button>
              <button type="button" aria-pressed={mode === "text"} onClick={() => setMode("text")}>
                Text einfügen
              </button>
            </div>
            <label className="workbench-wide">
              {mode === "url" ? "URL der Stellenanzeige" : "Beschreibungstext"}
              {mode === "url" ? (
                <input
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  type="url"
                  required
                  placeholder="https://…"
                  maxLength={2048}
                />
              ) : (
                <textarea
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  required
                  placeholder="Füge die öffentlich sichtbare Stellenbeschreibung hier ein …"
                  maxLength={20000}
                />
              )}
            </label>
            <button className="community-button" disabled={loading}>
              {loading ? "Anzeige wird ausgewertet …" : "Mit KI auswerten"}
            </button>
          </form>
          {suggestion && (
            <form
              className="job-preview"
              onSubmit={(event) =>
                void submit(
                  event,
                  "/api/bewerbungswerkstatt/applications",
                  "Bewerbung gespeichert.",
                )
              }
            >
              <p className="eyebrow">KI-Vorschlag · vor dem Speichern prüfen</p>
              <h2>Vorschau bearbeiten.</h2>
              <label>
                Unternehmen
                <input name="company" required maxLength={160} defaultValue={suggestion.company} />
              </label>
              <label>
                Stellenbezeichnung
                <input name="role" required maxLength={160} defaultValue={suggestion.role} />
              </label>
              <label>
                Link zur Ausschreibung
                <input
                  name="jobUrl"
                  type="url"
                  maxLength={2048}
                  defaultValue={suggestion.jobUrl ?? ""}
                />
              </label>
              <label>
                Gehalt / Vergütung
                <input name="salary" maxLength={120} defaultValue={suggestion.salary ?? ""} />
              </label>
              <label>
                Frist
                <input name="deadlineAt" type="date" defaultValue={suggestion.deadlineAt ?? ""} />
              </label>
              <label>
                Status
                <select name="status">
                  <option value="draft">Entwurf</option>
                </select>
              </label>
              <label className="workbench-wide">
                Notizen
                <input name="notes" maxLength={8000} defaultValue={suggestion.notes} />
              </label>
              <p className="workbench-wide import-notice">
                Erst mit „Bewerbung speichern“ wird ein privater Eintrag angelegt.
              </p>
              <button className="community-button">Bewerbung speichern</button>
            </form>
          )}
        </section>
      )}
      {step === "profile" && (
        <section className="workbench-form">
          <p className="eyebrow">Nachweise</p>
          <h2>Erfahrung und Projekte.</h2>
          <form
            onSubmit={(event) =>
              void submit(event, "/api/bewerbungswerkstatt/profile", "Profilbaustein gespeichert.")
            }
          >
            <label>
              Art
              <select name="kind">
                <option value="experience">Erfahrung</option>
                <option value="project">Projekt</option>
              </select>
            </label>
            <label>
              Titel
              <input name="title" required maxLength={160} />
            </label>
            <label>
              Organisation
              <input name="organization" maxLength={160} />
            </label>
            <label className="workbench-wide">
              Beschreibung
              <textarea name="description" maxLength={8000} />
            </label>
            <button className="community-button">Baustein speichern</button>
          </form>
          <div className="profile-list">
            {items.map((item) => (
              <article key={item.id}>
                <b>{item.title}</b>
                <span>
                  {item.kind}
                  {item.organization && ` · ${item.organization}`}
                </span>
              </article>
            ))}
          </div>
          <section className="skill-form">
            <p className="eyebrow">Kompetenzen</p>
            <h2>Belegte Erfahrung.</h2>
            <p className="workbench-intro">
              Lernfelder bleiben ausdrücklich getrennt. Erfahrung braucht mindestens einen Beleg.
            </p>
            <form
              onSubmit={(event) =>
                void submit(event, "/api/bewerbungswerkstatt/skills", "Kompetenz gespeichert.")
              }
            >
              <label>
                Name
                <input name="name" required maxLength={120} />
              </label>
              <label>
                Art
                <select name="kind">
                  <option value="experience">Erfahrung</option>
                  <option value="learning">Lernfeld</option>
                </select>
              </label>
              <label>
                Niveau
                <select name="level">
                  <option value="basic">Grundlagen</option>
                  <option value="working">Praxis</option>
                  <option value="advanced">Fortgeschritten</option>
                  <option value="expert">Expertise</option>
                </select>
              </label>
              <label className="workbench-wide">
                Belege (bei Erfahrung mindestens einer)
                <select name="careerItemIds" multiple>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
              <button className="community-button">Kompetenz speichern</button>
            </form>
            {skills.map((skill) => (
              <article className="editor-entry" key={skill.id}>
                <b>{skill.name}</b>
                <small>
                  {skill.kind === "learning" ? "Lernfeld" : "Erfahrung"} · {skill.level}
                </small>
              </article>
            ))}
          </section>
        </section>
      )}
    </main>
  );
}
