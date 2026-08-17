"use client";
/* eslint-disable @next/next/no-html-link-for-pages, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { FormEvent, useEffect, useState } from "react";
import {
  applicationDocumentStatusLabels,
  applicationDocumentTypeLabels,
  type ApplicationDocumentStatus,
} from "../../../../db/application-documents";
import { applicationStatusLabels, nextApplicationStatuses } from "../../../../db/workflow";
type Attachment = { id: string; kind: string; fileName: string; size: string };
type DocumentVersion = {
  id: string;
  documentType: keyof typeof applicationDocumentTypeLabels;
  status: keyof typeof applicationDocumentStatusLabels;
  version: string;
  content: string;
  sourceNote: string;
  analysisId: string | null;
  createdAt: string;
};
type Application = {
  company: string;
  role: string;
  status: string;
  jobUrl: string | null;
  salary: string | null;
  deadlineAt: string | null;
  followUpAt: string | null;
  applicationMethod: string | null;
  appliedAt: string | null;
  notes: string;
};
type TimelineEvent = { id: string; type: string; occurredAt: string; note: string };
type CareerItem = { id: string; title: string; organization: string; kind: string };
type Detail = {
  app: Application;
  attachments: Attachment[];
  documents: DocumentVersion[];
  timeline: TimelineEvent[];
  evidence: { careerItemId: string }[];
  career: CareerItem[];
};
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
    [message, setMessage] = useState(""),
    [documentStatus, setDocumentStatus] = useState<ApplicationDocumentStatus>("draft");
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
    const form = event.currentTarget;
    try {
      const response = await fetch(`/api/bewerbungswerkstatt/applications/${id}/attachments`, {
          method: "POST",
          body: new FormData(form),
        }),
        data = await response.json();
      if (!response.ok) throw new Error(data?.error);
      form.reset();
      setMessage("Dokument hochgeladen.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload fehlgeschlagen.");
    }
  };
  const saveDocument = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget,
      values = Object.fromEntries(new FormData(form));
    try {
      await request(`/api/bewerbungswerkstatt/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: "document",
          ...values,
          finalConfirmed: values.finalConfirmed === "on",
          evidenceConfirmed: values.evidenceConfirmed === "on",
        }),
      });
      form.reset();
      setDocumentStatus("draft");
      setMessage("Neue Dokumentversion gespeichert.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Dokument konnte nicht gespeichert werden.",
      );
    }
  };
  const saveEvidence = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await request(`/api/bewerbungswerkstatt/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: "evidence",
          careerItemIds: new FormData(form).getAll("careerItemIds"),
        }),
      });
      setMessage("Profilbelege gespeichert.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Profilbelege konnten nicht gespeichert werden.",
      );
    }
  };
  const addTimeline = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await request(`/api/bewerbungswerkstatt/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "timeline", ...Object.fromEntries(new FormData(form)) }),
      });
      form.reset();
      setMessage("Ereignis in der Timeline ergänzt.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Ereignis konnte nicht gespeichert werden.",
      );
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
            <label>
              Status
              <select name="status" defaultValue={app.status}>
                {nextApplicationStatuses(app.status as keyof typeof applicationStatusLabels).map(
                  (value) => (
                    <option key={value} value={value}>
                      {applicationStatusLabels[value]}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label>
              Versanddatum
              <input name="appliedAt" type="date" defaultValue={app.appliedAt ?? ""} />
            </label>
            <label>
              Versandweg
              <input
                name="applicationMethod"
                defaultValue={app.applicationMethod ?? ""}
                maxLength={160}
                placeholder="z. B. Karriereportal"
              />
            </label>
            <label className="editor-wide">
              Notizen
              <textarea name="notes" defaultValue={app.notes} maxLength={8000} />
            </label>
            <button className="community-button">Stellendaten speichern</button>
            <p className="editor-hint">
              Der Status kann nur zum nächsten fachlich erlaubten Schritt wechseln und erzeugt
              automatisch einen Timeline-Eintrag.
            </p>
          </form>
          <section className="timeline-section">
            <p className="eyebrow">Verlauf</p>
            <h2>Timeline</h2>
            <form className="timeline-form" onSubmit={addTimeline}>
              <label>
                Ereignis ohne Statuswechsel
                <select name="type" defaultValue="note">
                  <option value="follow_up">Follow-up</option>
                  <option value="note">Notiz</option>
                </select>
              </label>
              <label>
                Tatsächliches Datum
                <input name="occurredAt" type="date" required />
              </label>
              <label className="editor-wide">
                Notiz
                <textarea name="note" maxLength={4000} placeholder="Was ist passiert?" />
              </label>
              <button className="community-button">Ereignis nachtragen</button>
            </form>
            <div className="timeline-list">
              {detail.timeline.map((event) => (
                <article key={event.id}>
                  <time>{event.occurredAt.slice(0, 10)}</time>
                  <div>
                    <b>{event.type.replaceAll("_", " ")}</b>
                    {event.note && <p>{event.note}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
        <aside>
          <p className="eyebrow">Textversionen</p>
          <form onSubmit={saveEvidence}>
            <label>
              Profilbelege für fachliche Aussagen
              <span className="editor-hint">
                Finale Texte benötigen mindestens einen eigenen, hier zugeordneten Profilbeleg.
              </span>
            </label>
            {detail.career.length ? (
              detail.career.map((item) => (
                <label className="check" key={item.id}>
                  <input
                    name="careerItemIds"
                    type="checkbox"
                    value={item.id}
                    defaultChecked={detail.evidence.some(
                      (evidence) => evidence.careerItemId === item.id,
                    )}
                  />
                  {item.title}
                  {item.organization ? ` · ${item.organization}` : ""}
                </label>
              ))
            ) : (
              <p className="editor-hint">Lege zuerst einen Profilbaustein in der Werkstatt an.</p>
            )}
            <button className="community-button" disabled={!detail.career.length}>
              Profilbelege speichern
            </button>
          </form>
          <form onSubmit={saveDocument}>
            <label>
              Dokumentart
              <select name="documentType" defaultValue="cover_letter">
                <option value="cover_letter">Anschreiben</option>
                <option value="email">Bewerbungs-E-Mail</option>
                <option value="form_response">Formularantwort</option>
              </select>
            </label>
            <label>
              Status
              <select
                name="status"
                value={documentStatus}
                onChange={(event) =>
                  setDocumentStatus(event.target.value as ApplicationDocumentStatus)
                }
              >
                <option value="draft">Entwurf</option>
                <option value="reviewed">Geprüft</option>
                <option value="final">Final</option>
              </select>
            </label>
            <label>
              Text
              <textarea name="content" maxLength={20000} required />
            </label>
            <label>
              Quellen und geprüfte Angaben
              <textarea
                name="sourceNote"
                maxLength={4000}
                required
                placeholder="Profilbelege, Stellenausschreibung und eigene Ergänzungen festhalten."
              />
            </label>
            <label className="check">
              <input name="finalConfirmed" type="checkbox" required={documentStatus === "final"} />
              Ich habe den Text geprüft; er behauptet keine nicht belegten Kenntnisse.
            </label>
            <label className="check">
              <input
                name="evidenceConfirmed"
                type="checkbox"
                required={documentStatus === "final"}
              />
              Ich habe die fachlichen Aussagen gegen mindestens einen eigenen Profilbeleg geprüft.
            </label>
            <small>
              Finale Texte benötigen zusätzlich einen zugeordneten Profilbeleg. Jede Speicherung
              erzeugt eine neue Version. Es gibt keinen automatischen Versand.
            </small>
            <button className="community-button">Textversion speichern</button>
          </form>
          {detail.documents.map((document) => (
            <article className="editor-entry" key={document.id}>
              <b>
                {applicationDocumentTypeLabels[document.documentType]} · v{document.version}
              </b>
              <small>
                {applicationDocumentStatusLabels[document.status]} ·{" "}
                {new Date(document.createdAt).toLocaleString("de-DE")}
              </small>
              <p>{document.content}</p>
              <small>
                Quellen: {document.sourceNote}
                {document.analysisId ? " · bestätigte Stellenprüfung verknüpft" : ""}
              </small>
            </article>
          ))}
          <p className="eyebrow editor-label">Dateien</p>
          <form onSubmit={upload}>
            <label>
              Art
              <select name="kind">
                <option value="cover_letter">Anschreiben</option>
                <option value="email">Bewerbungs-E-Mail</option>
                <option value="form_response">Formularantwort</option>
                <option value="application">Bewerbungsunterlage</option>
                <option value="confirmation">Bewerbungsbestätigung</option>
                <option value="response">Antwortschreiben</option>
                <option value="other">Sonstiges</option>
              </select>
            </label>
            <label>
              Datei
              <input
                name="file"
                type="file"
                accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                required
              />
            </label>
            <small>PDF oder DOCX, maximal 10 MB.</small>
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
