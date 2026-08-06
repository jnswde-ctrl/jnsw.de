"use client";
/* eslint-disable @next/next/no-html-link-for-pages, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { FormEvent, useEffect, useState } from "react";
type Attachment = { id: string; kind: string; fileName: string; size: string };
type Application = {
  company: string;
  role: string;
  status: string;
  jobUrl: string | null;
  salary: string | null;
  deadlineAt: string | null;
  followUpAt: string | null;
  notes: string;
};
type Detail = { app: Application; attachments: Attachment[] };
const request = async (path: string, options?: RequestInit) => {
  const response = await fetch(path, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    }),
    data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? "Bitte erneut versuchen.");
  return data;
};
export function ApplicationEditor({ id }: { id: string }) {
  const [detail, setDetail] = useState<Detail | null>(null),
    [message, setMessage] = useState("");
  const load = async () => {
    try {
      setDetail(await request(`/api/bewerbungswerkstatt/applications/${id}`));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Laden fehlgeschlagen.");
    }
  };
  useEffect(() => {
    void load();
  }, [id]);
  const saveDetails = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await request(`/api/bewerbungswerkstatt/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
      });
      setMessage("Stellendaten gespeichert.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Speichern fehlgeschlagen.");
    }
  };
  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(`/api/bewerbungswerkstatt/applications/${id}/attachments`, {
          method: "POST",
          body: new FormData(event.currentTarget),
        }),
        data = await response.json();
      if (!response.ok) throw new Error(data?.error);
      event.currentTarget.reset();
      setMessage("Dokument hochgeladen.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload fehlgeschlagen.");
    }
  };
  const remove = async (attachmentId: string) => {
    try {
      const response = await fetch(
        `/api/bewerbungswerkstatt/applications/${id}/attachments/${attachmentId}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Löschen fehlgeschlagen.");
      setMessage("Dokument gelöscht.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Löschen fehlgeschlagen.");
    }
  };
  if (!detail)
    return (
      <main className="workbench">
        <p>{message || "Wird geladen …"}</p>
      </main>
    );
  const { app } = detail;
  return (
    <main className="workbench">
      <a className="workbench-back" href="/community/bewerbungswerkstatt">
        ← Übersicht
      </a>
      <header className="workbench-detail-head">
        <p className="eyebrow">{app.company}</p>
        <h1>
          {app.role}
          <span>.</span>
        </h1>
      </header>
      {message && (
        <p className="workbench-message" role="status">
          {message}
        </p>
      )}
      <section className="editor-grid">
        <div>
          <p className="eyebrow">Stellendaten</p>
          <form className="application-detail-form" onSubmit={saveDetails}>
            <label>
              Unternehmen
              <input name="company" defaultValue={app.company} required maxLength={160} />
            </label>
            <label>
              Position
              <input name="role" defaultValue={app.role} required maxLength={160} />
            </label>
            <label>
              Gehalt
              <input
                name="salary"
                defaultValue={app.salary ?? ""}
                maxLength={120}
                placeholder="z. B. 55.000–65.000 € brutto/Jahr"
              />
            </label>
            <label>
              Link zur Ausschreibung
              <input name="jobUrl" type="url" defaultValue={app.jobUrl ?? ""} maxLength={2048} />
            </label>
            <label>
              Bewerbungsfrist
              <input name="deadlineAt" type="date" defaultValue={app.deadlineAt ?? ""} />
            </label>
            <label>
              Follow-up
              <input name="followUpAt" type="date" defaultValue={app.followUpAt ?? ""} />
            </label>
            <label className="editor-wide">
              Notizen
              <textarea name="notes" defaultValue={app.notes} maxLength={8000} />
            </label>
            <button className="community-button">Stellendaten speichern</button>
          </form>
        </div>
        <aside>
          <p className="eyebrow">Dateien</p>
          <form onSubmit={upload}>
            <label>
              Art
              <select name="kind">
                <option value="application">Bewerbungsunterlage</option>
                <option value="confirmation">Bewerbungsbestätigung</option>
                <option value="response">Antwortschreiben</option>
                <option value="other">Sonstiges</option>
              </select>
            </label>
            <label>
              PDF-Datei
              <input name="file" type="file" accept="application/pdf,.pdf" required />
            </label>
            <small>PDF, maximal 10 MB.</small>
            <button className="community-button">Dokument hochladen</button>
          </form>
          {detail.attachments.map((attachment) => (
            <article className="editor-entry" key={attachment.id}>
              <b>{attachment.fileName}</b>
              <small>
                {attachment.kind} · {Math.ceil(Number(attachment.size) / 1024)} KB
              </small>
              <p>
                <a
                  href={`/api/bewerbungswerkstatt/applications/${id}/attachments/${attachment.id}`}
                >
                  Herunterladen
                </a>{" "}
                <button type="button" onClick={() => void remove(attachment.id)}>
                  Löschen
                </button>
              </p>
            </article>
          ))}
        </aside>
      </section>
    </main>
  );
}
