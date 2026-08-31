"use client";

import { useMemo, useState } from "react";
import {
  initialListings,
  Listing,
  ListingStatus,
  Platform,
  STATUS_LABELS,
} from "./listingsData";

const PLATFORMS: Platform[] = ["Kleinanzeigen", "Immowelt", "WG-Gesucht", "ImmoScout24"];
const STATUSES: ListingStatus[] = ["neu", "interessant", "abgelehnt", "vorbereitet", "versendet"];
const ROOM_OPTIONS = [1, 2, 3, 4];

function draftLetter(listing: Listing) {
  return `Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihr Inserat „${listing.title}“ in ${listing.city} gesehen und möchte mich hiermit als Mietinteressent vorstellen.

Die Wohnung passt gut zu meinem Suchprofil (2 Zimmer, ca. 700 € warm, Raum Mönchengladbach/Kaarst). Über eine Einladung zur Besichtigung würde ich mich sehr freuen. Gerne reiche ich alle üblichen Unterlagen (Schufa, Einkommensnachweise, Mieterselbstauskunft) nach.

Mit freundlichen Grüßen
[Platzhalter-Name]

—
Dies ist ein Beispieltext ohne echte KI-Anbindung. Er dient nur der Vorschau des Freigabe-Workflows.`;
}

export function WohnungssucheWorkbench() {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [rentMax, setRentMax] = useState(750);
  const [rooms, setRooms] = useState<number | "alle">("alle");
  const [platform, setPlatform] = useState<Platform | "alle">("alle");
  const [status, setStatus] = useState<ListingStatus | "alle">("alle");
  const [letterListing, setLetterListing] = useState<Listing | null>(null);

  const filtered = useMemo(
    () =>
      listings.filter((l) => {
        if (l.rentWarm > rentMax) return false;
        if (rooms !== "alle" && l.rooms !== rooms) return false;
        if (platform !== "alle" && l.platform !== platform) return false;
        if (status !== "alle" && l.status !== status) return false;
        return true;
      }),
    [listings, rentMax, rooms, platform, status],
  );

  const updateStatus = (id: string, next: ListingStatus) => {
    setListings((current) => current.map((l) => (l.id === id ? { ...l, status: next } : l)));
  };

  return (
    <section className="wohnung-tool" aria-labelledby="wohnung-tool-title">
      <p className="eyebrow">Schritt 01 / Freigabe-Queue</p>
      <h3 id="wohnung-tool-title">Prototyp · Wohnungssuche-Assistent</h3>
      <p>
        Mock-Daten, rein clientseitig. Keine echte Feed- oder KI-Anbindung – zeigt nur den
        geplanten Screen-Flow der Freigabe-Queue.
      </p>

      <div className="wohnung-filters">
        <label>
          Miete bis
          <input
            type="range"
            min={550}
            max={800}
            step={10}
            value={rentMax}
            onChange={(e) => setRentMax(Number(e.target.value))}
          />
          <span>{rentMax} €</span>
        </label>
        <label>
          Zimmer
          <select
            value={rooms}
            onChange={(e) => setRooms(e.target.value === "alle" ? "alle" : Number(e.target.value))}
          >
            <option value="alle">Alle</option>
            {ROOM_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label>
          Plattform
          <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform | "alle")}>
            <option value="alle">Alle</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ListingStatus | "alle")}
          >
            <option value="alle">Alle</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <span className="wohnung-filter-count">
          {filtered.length} von {listings.length} Inseraten
        </span>
      </div>

      <div className="wohnung-grid">
        {filtered.map((listing) => (
          <article key={listing.id} className="wohnung-card">
            <div className="wohnung-card-badges">
              <span className="wohnung-badge-platform">{listing.platform}</span>
              <span className={`wohnung-badge-status wohnung-status-${listing.status}`}>
                {STATUS_LABELS[listing.status]}
              </span>
            </div>
            <h4>{listing.title}</h4>
            <dl className="wohnung-card-facts">
              <div>
                <dt>Miete</dt>
                <dd>{listing.rentWarm} € warm</dd>
              </div>
              <div>
                <dt>Zimmer</dt>
                <dd>
                  {listing.rooms} · {listing.sizeSqm} m²
                </dd>
              </div>
              <div>
                <dt>Ort</dt>
                <dd>{listing.city}</dd>
              </div>
            </dl>
            <div className="wohnung-card-actions">
              <select
                aria-label="Status ändern"
                value={listing.status}
                onChange={(e) => updateStatus(listing.id, e.target.value as ListingStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <a href={listing.url} target="_blank" rel="noreferrer">
                Original ↗
              </a>
            </div>
            {listing.status === "interessant" && (
              <button
                type="button"
                className="button wohnung-generate-button"
                onClick={() => setLetterListing(listing)}
              >
                Anschreiben generieren
              </button>
            )}
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="wohnung-empty">Keine Inserate für diese Filterkombination.</p>
        )}
      </div>

      {letterListing && (
        <div
          className="wohnung-letter-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLetterListing(null);
          }}
        >
          <div
            className="wohnung-letter-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wohnung-letter-title"
          >
            <header>
              <p className="eyebrow">Platzhalter · noch keine echte KI-Anbindung</p>
              <h4 id="wohnung-letter-title">Anschreiben – {letterListing.title}</h4>
              <button
                type="button"
                className="workspace-close"
                onClick={() => setLetterListing(null)}
                aria-label="Anschreiben-Vorschau schließen"
              >
                <span>Schließen</span>
                <b aria-hidden="true">×</b>
              </button>
            </header>
            <pre className="wohnung-letter-text">{draftLetter(letterListing)}</pre>
          </div>
        </div>
      )}
    </section>
  );
}
