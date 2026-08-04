"use client";

import { FormEvent, useState } from "react";

type User = { displayName: string; status: "active" | "suspended"; emailVerifiedAt: string | null };
export function CommunityAccount({ initialUser }: { initialUser: User | null }) {
  const [user, setUser] = useState(initialUser);
  const [mode, setMode] = useState<"login" | "register">("register");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) return setMessage(result.error ?? "Bitte erneut versuchen.");
    if (mode === "register") {
      event.currentTarget.reset(); setMode("login");
      return setMessage(result.message ?? "Bitte bestätige deine E-Mail-Adresse.");
    }
    if (!result.user) return setMessage(result.message ?? "Bitte prüfe dein Postfach.");
    setUser(result.user); setMessage("");
  }
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); }
  if (user?.status === "suspended") return <section className="community-account"><p className="eyebrow">Konto</p><h2>Konto pausiert.</h2><p>Dein Konto ist derzeit nicht aktiv. Schreib uns an <a href="mailto:hello@jnsw.de">hello@jnsw.de</a>.</p></section>;
  if (user) return <section className="community-account"><p className="eyebrow">Mitgliedschaft</p><h2>Willkommen, {user.displayName}.</h2><p>Dein Konto ist aktiv. Weitere Community-Funktionen folgen.</p><button className="community-button secondary" onClick={logout}>Abmelden</button></section>;
  return <section className="community-account" aria-labelledby="community-account-title"><p className="eyebrow">Mitgliedschaft</p><h2 id="community-account-title">Komm dazu.</h2><p>Mit einem Konto kannst du künftig Community-Angebote nutzen.</p><div className="community-tabs"><button onClick={() => setMode("register")} aria-pressed={mode === "register"}>Konto erstellen</button><button onClick={() => setMode("login")} aria-pressed={mode === "login"}>Anmelden</button></div><form onSubmit={submit}><label>{mode === "register" && <>Anzeigename<input name="displayName" required maxLength={100} autoComplete="name" /></>}E-Mail-Adresse<input name="email" type="email" required autoComplete="email" /></label><label>Passwort<input name="password" type="password" required minLength={12} maxLength={256} autoComplete={mode === "login" ? "current-password" : "new-password"} />{mode === "register" && <small>Mindestens 12 Zeichen.</small>}</label>{message && <p role="alert" className="community-error">{message}</p>}<button className="community-button" disabled={busy}>{busy ? "Wird verarbeitet …" : mode === "register" ? "Konto erstellen" : "Anmelden"}</button></form></section>;
}
