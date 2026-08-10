import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Miniflare } from "miniflare";

const migrations = Array.from(
  { length: 9 },
  (_, index) =>
    new URL(
      `../drizzle/${String(index).padStart(4, "0")}_${
        [
          "odd_taskmaster",
          "secret_thunderbolt_ross",
          "slow_masked_marvel",
          "loud_arclight",
          "neat_switch",
          "moaning_gwen_stacy",
          "sweet_overlord",
          "clear_user_data",
          "wealthy_goblin_queen",
        ][index]
      }.sql`,
      import.meta.url,
    ),
);

async function applyMigration(db: D1Database, migration: URL) {
  const sql = await readFile(migration, "utf8");
  for (const statement of sql.split("--> statement-breakpoint")) {
    if (statement.trim()) await db.prepare(statement).run();
  }
}

test("migrates legacy applications and enforces one application per opportunity in D1", async () => {
  const runtime = new Miniflare({
    workers: [
      {
        modules: true,
        script: "export default { fetch() { return new Response('ok'); } };",
        d1Databases: { DB: "opportunity-test" },
      },
    ],
  });
  try {
    const db = await runtime.getD1Database("DB");
    for (const migration of migrations.slice(0, 8)) await applyMigration(db, migration);
    await db
      .prepare("INSERT INTO users (id, email, display_name) VALUES (?, ?, ?)")
      .bind("user-a", "a@example.test", "A")
      .run();
    await db
      .prepare(
        "INSERT INTO job_applications (id, user_id, company, role, status, notes) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind("legacy-application", "user-a", "Example GmbH", "Developer", "draft", "")
      .run();
    await applyMigration(db, migrations[8]);

    const legacy = await db
      .prepare("SELECT opportunity_id FROM job_applications WHERE id = ?")
      .bind("legacy-application")
      .first<{ opportunity_id: string }>();
    assert.equal(legacy?.opportunity_id, "legacy:legacy-application");

    await assert.rejects(
      db
        .prepare(
          "INSERT INTO job_applications (id, user_id, opportunity_id, company, role, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          "duplicate",
          "user-a",
          legacy?.opportunity_id,
          "Example GmbH",
          "Developer",
          "draft",
          "",
        )
        .run(),
    );
    await assert.rejects(
      db
        .prepare(
          "INSERT INTO job_applications (id, user_id, opportunity_id, company, role, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .bind("orphan", "user-a", "missing-opportunity", "Example GmbH", "Developer", "draft", "")
        .run(),
    );
  } finally {
    await runtime.dispose();
  }
});
