"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import Link from "next/link";
import { useEffect, useState } from "react";

type Detail = {
  opportunity: {
    company: string;
    role: string;
    jobUrl: string | null;
    sourceCheckedAt: string | null;
    listingStatus: string;
    reviewStatus: string;
  };
  application: { id: string } | null;
};
type Analysis = {
  analyses: Array<{
    id: string;
    score: string;
    recommendation: string;
    strengths: string;
    gaps: string;
    risks: string;
    confirmedAt: string | null;
  }>;
  evidence: unknown[];
};
type ConfirmedAction = { body: Record<string, unknown>; success: string; label: string };
const request = async (path: string, options?: RequestInit) => {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? "Bitte erneut versuchen.");
  return data;
};
export function OpportunityEditor({ id }: { id: string }) {
  const [detail, setDetail] = useState<Detail | null>(null),
    [analysis, setAnalysis] = useState<Analysis | null>(null),
    [message, setMessage] = useState(""),
    [confirmation, setConfirmation] = useState<ConfirmedAction | null>(null);
  const load = async () => {
    try {
      const [d, a] = await Promise.all([
        request(`/api/bewerbungswerkstatt/opportunities/${id}`),
        request(`/api/bewerbungswerkstatt/opportunities/${id}/analysis`),
      ]);
      setDetail(d);
      setAnalysis(a);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Laden fehlgeschlagen.");
    }
  };
  useEffect(() => {
    void load();
  }, [id]);
  const action = async (body: Record<string, unknown>, success: string) => {
    try {
      await request(`/api/bewerbungswerkstatt/opportunities/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setMessage(success);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Aktion fehlgeschlagen.");
    }
  };
  if (!detail)
    return (
      <main className="workbench">
        <p>{message || "Wird geladen …"}</p>
      </main>
    );
  const latest = analysis?.analyses[0];
  const needsAnalysis = detail.opportunity.reviewStatus === "reviewing" && !latest;
  const canConvert = detail.opportunity.reviewStatus === "recommended" && Boolean(latest);
  const requestConfirmation = (body: Record<string, unknown>, success: string, label: string) =>
    setConfirmation({ body, success, label });
  return (
    <main className="workbench">
      <Link className="workbench-back" href="/community/bewerbungswerkstatt">
        ← Übersicht
      </Link>
      <header className="workbench-detail-head">
        <p className="eyebrow">Stellenprüfung</p>
        <h1>
          {detail.opportunity.role}
          <span>.</span>
        </h1>
        <p>{detail.opportunity.company}</p>
      </header>
      {message && (
        <p className="workbench-message" role="status">
          {message}
        </p>
      )}
      {confirmation && (
        <section
          className="workbench-confirmation"
          role="alertdialog"
          aria-modal="true"
          aria-label="Aktion bestätigen"
        >
          <p className="eyebrow">Bestätigung erforderlich</p>
          <h2>{confirmation.label}?</h2>
          <p>Die Änderung wird in der Timeline dieser Stelle dokumentiert.</p>
          <div>
            <button className="community-button secondary" onClick={() => setConfirmation(null)}>
              Abbrechen
            </button>
            <button
              className="community-button"
              onClick={() => {
                void action(confirmation.body, confirmation.success);
                setConfirmation(null);
              }}
            >
              Bestätigen
            </button>
          </div>
        </section>
      )}
      <section className="editor-grid">
        <div>
          <p className="eyebrow">Quelle und Bewertung</p>
          <p>
            {detail.opportunity.jobUrl ? (
              <a href={detail.opportunity.jobUrl}>Quelle öffnen</a>
            ) : (
              "Keine Quell-URL"
            )}
          </p>
          <p>
            Zuletzt geprüft: {detail.opportunity.sourceCheckedAt?.slice(0, 10) ?? "unbekannt"} ·
            Anzeige: {detail.opportunity.listingStatus}
          </p>
          {latest ? (
            <article className="editor-entry">
              <b>
                Score {latest.score}/100 · {latest.recommendation}
              </b>
              <p>Stärken: {JSON.parse(latest.strengths).join(", ") || "—"}</p>
              <p>Lücken: {JSON.parse(latest.gaps).join(", ") || "—"}</p>
              <p>Risiken: {JSON.parse(latest.risks).join(", ") || "—"}</p>
              <small>{latest.confirmedAt ? "Bestätigt" : "Noch nicht bestätigt"}</small>
            </article>
          ) : (
            <p>Noch keine Analyse angelegt.</p>
          )}
        </div>
        <aside>
          <p className="eyebrow">Entscheidung</p>
          {detail.opportunity.reviewStatus === "reviewing" ? (
            <>
              {needsAnalysis && (
                <p className="editor-hint">
                  Lege und bestätige zuerst eine Analyse, bevor du entscheidest.
                </p>
              )}
              <button
                className="community-button"
                disabled={needsAnalysis}
                onClick={() =>
                  requestConfirmation(
                    { reviewStatus: "recommended" },
                    "Als empfehlenswert markiert.",
                    "Stelle empfehlen",
                  )
                }
              >
                Empfehlen
              </button>
              <button
                className="community-button"
                disabled={needsAnalysis}
                onClick={() =>
                  requestConfirmation(
                    { reviewStatus: "on_hold" },
                    "Zurückgestellt.",
                    "Stelle zurückstellen",
                  )
                }
              >
                Zurückstellen
              </button>
              <button
                className="community-button"
                disabled={needsAnalysis}
                onClick={() =>
                  requestConfirmation(
                    { reviewStatus: "not_recommended" },
                    "Nicht empfohlen.",
                    "Stelle nicht empfehlen",
                  )
                }
              >
                Nicht empfehlen
              </button>
            </>
          ) : (
            <button
              className="community-button"
              onClick={() =>
                requestConfirmation(
                  { reviewStatus: "reviewing" },
                  "Prüfung gestartet.",
                  detail.opportunity.reviewStatus === "unreviewed"
                    ? "Prüfung starten"
                    : "Prüfung erneut starten",
                )
              }
            >
              {detail.opportunity.reviewStatus === "unreviewed"
                ? "Prüfung starten"
                : "Erneut prüfen"}
            </button>
          )}
          <button
            className="community-button"
            onClick={() =>
              requestConfirmation(
                { listingStatus: "closed" },
                "Anzeige als geschlossen markiert.",
                "Anzeige als geschlossen markieren",
              )
            }
          >
            Anzeige geschlossen
          </button>
          {detail.application ? (
            <Link
              className="community-button"
              href={`/community/bewerbungswerkstatt/${detail.application.id}`}
            >
              Bewerbung öffnen
            </Link>
          ) : (
            <button
              className="community-button"
              disabled={!canConvert}
              onClick={() =>
                requestConfirmation(
                  { action: "convert" },
                  "Bewerbung angelegt.",
                  "In Bewerbung überführen",
                )
              }
            >
              In Bewerbung überführen
            </button>
          )}
          {!canConvert && !detail.application && (
            <p className="editor-hint">
              Eine bestätigte Analyse und Empfehlung sind vor der Überführung erforderlich.
            </p>
          )}
        </aside>
      </section>
    </main>
  );
}
