"use client";

import { useState } from "react";

export function EmailVerification({ token }: { token: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function verify() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    const result = await response.json();
    setBusy(false); setMessage(result.message ?? result.error ?? "Bitte erneut versuchen.");
  }
  if (!token) return <main className="subpage"><section className="community-section"><h1>Ungültiger Bestätigungslink.</h1><p>Bitte fordere eine neue Bestätigungs-E-Mail an.</p></section></main>;
  return <main className="subpage"><section className="community-section"><p className="eyebrow">JNSW.DE / Konto</p><h1>E-Mail bestätigen.</h1><p>Bestätige deine E-Mail-Adresse, um dein Konto freizuschalten.</p>{message ? <p role="status">{message}</p> : <button className="community-button" onClick={verify} disabled={busy}>{busy ? "Wird bestätigt …" : "E-Mail-Adresse bestätigen"}</button>}</section></main>;
}
