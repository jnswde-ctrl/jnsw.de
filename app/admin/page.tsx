import { notFound } from "next/navigation";
import { isActiveAdmin, requireAppUser } from "../auth";
import { AdminUsers } from "./AdminUsers";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAppUser();
  if (!user || !isActiveAdmin(user)) notFound();

  return (
    <main className="admin-workspace">
      <header className="admin-header">
        <a className="workbench-back" href="/community">← Zur Community</a>
        <div>
          <p className="eyebrow">JNSW.DE / Administration</p>
          <h1>Konten<br /><em>verwalten.</em><span>.</span></h1>
        </div>
        <p>Rollen und Kontostatus zentral verwalten. Änderungen werden erst nach dem Speichern wirksam.</p>
      </header>
      <AdminUsers />
    </main>
  );
}
