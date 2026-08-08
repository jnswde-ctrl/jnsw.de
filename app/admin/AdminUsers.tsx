"use client";

import { useCallback, useEffect, useState } from "react";

type User = {
  id: string;
  displayName: string;
  role: "admin" | "member";
  status: "active" | "suspended";
  createdAt: string;
  lastSignedInAt: string | null;
};

const pageSize = 25;
const dateFormatter = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" });

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "Noch nie";
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async (nextOffset: number) => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/users?limit=${pageSize}&offset=${nextOffset}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Benutzer konnten nicht geladen werden.");
      setUsers(result.users);
      setTotal(result.total);
      setOffset(nextOffset);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Benutzer konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load(0));
  }, [load]);

  async function save(user: User, changes: Pick<User, "role" | "status">) {
    if (user.role === changes.role && user.status === changes.status) return;
    setSavingId(user.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Änderung konnte nicht gespeichert werden.");
      setUsers((current) => current.map((item) => (item.id === user.id ? result.user : item)));
      setMessage(`Zugriff für ${result.user.displayName} aktualisiert.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Änderung konnte nicht gespeichert werden.",
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="admin-users" aria-labelledby="admin-users-title">
      <div className="admin-users-heading">
        <div>
          <p className="eyebrow">Benutzerverwaltung</p>
          <h2 id="admin-users-title">{total} Konten</h2>
        </div>
        <button
          className="admin-secondary-button"
          onClick={() => void load(offset)}
          disabled={loading}
        >
          Aktualisieren
        </button>
      </div>
      {message && (
        <p className="admin-message" role="status" aria-live="polite">
          {message}
        </p>
      )}
      {loading ? (
        <p className="admin-loading">Konten werden geladen …</p>
      ) : (
        <div className="admin-user-list">
          {users.map((user) => (
            <UserRow
              key={`${user.id}-${user.role}-${user.status}`}
              user={user}
              saving={savingId === user.id}
              onSave={save}
            />
          ))}
          {!users.length && <p className="admin-loading">Keine Konten vorhanden.</p>}
        </div>
      )}
      <nav className="admin-pagination" aria-label="Seitennavigation für Benutzer">
        <button
          className="admin-secondary-button"
          onClick={() => void load(Math.max(0, offset - pageSize))}
          disabled={loading || offset === 0}
        >
          Zurück
        </button>
        <span>
          {total
            ? `${offset + 1}–${Math.min(offset + users.length, total)} von ${total}`
            : "0 Konten"}
        </span>
        <button
          className="admin-secondary-button"
          onClick={() => void load(offset + pageSize)}
          disabled={loading || offset + users.length >= total}
        >
          Weiter
        </button>
      </nav>
    </section>
  );
}

function UserRow({
  user,
  saving,
  onSave,
}: {
  user: User;
  saving: boolean;
  onSave: (user: User, changes: Pick<User, "role" | "status">) => Promise<void>;
}) {
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);
  return (
    <article className="admin-user-row">
      <div className="admin-user-meta">
        <b>{user.displayName}</b>
        <span title={user.id}>ID: {user.id}</span>
        <small>
          Erstellt: {formatDate(user.createdAt)} · Letzte Anmeldung:{" "}
          {formatDate(user.lastSignedInAt)}
        </small>
      </div>
      <label>
        Rolle
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as User["role"])}
          disabled={saving}
        >
          <option value="member">Mitglied</option>
          <option value="admin">Administrator</option>
        </select>
      </label>
      <label>
        Status
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as User["status"])}
          disabled={saving}
        >
          <option value="active">Aktiv</option>
          <option value="suspended">Pausiert</option>
        </select>
      </label>
      <button
        className="community-button"
        onClick={() => void onSave(user, { role, status })}
        disabled={saving || (role === user.role && status === user.status)}
      >
        {saving ? "Speichert …" : "Speichern"}
      </button>
    </article>
  );
}
