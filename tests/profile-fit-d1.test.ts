import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Miniflare } from "miniflare";

const migrations = [
  "0000_odd_taskmaster",
  "0001_secret_thunderbolt_ross",
  "0002_slow_masked_marvel",
  "0003_loud_arclight",
  "0004_neat_switch",
  "0005_moaning_gwen_stacy",
  "0006_sweet_overlord",
  "0007_clear_user_data",
  "0008_wealthy_goblin_queen",
  "0009_bent_dragon_lord",
  "0010_loving_molly_hayes",
  "0011_eminent_vertigo",
].map((name) => new URL(`../drizzle/${name}.sql`, import.meta.url));

async function migrate(db: D1Database) {
  for (const migration of migrations) {
    for (const statement of (await readFile(migration, "utf8")).split("--> statement-breakpoint"))
      if (statement.trim()) await db.prepare(statement).run();
  }
}

test("keeps analysis versions, evidence and confirmations tenant-scoped in D1", async () => {
  const runtime = new Miniflare({
    workers: [
      {
        modules: true,
        script: "export default { fetch() { return new Response('ok'); } };",
        d1Databases: { DB: "profile-fit-test" },
      },
    ],
  });
  try {
    const db = await runtime.getD1Database("DB");
    await migrate(db);
    for (const [id, email] of [
      ["a", "a@test"],
      ["b", "b@test"],
    ])
      await db
        .prepare("INSERT INTO users (id,email,display_name) VALUES (?,?,?)")
        .bind(id, email, id)
        .run();
    await db
      .prepare(
        "INSERT INTO job_opportunities (id,user_id,source_key,source_type,company,role,notes) VALUES ('oa','a','a','manual','A','Dev','')",
      )
      .run();
    await db
      .prepare(
        "INSERT INTO career_items (id,user_id,kind,title,description) VALUES ('ca','a','project','A','')",
      )
      .run();
    await db
      .prepare(
        "INSERT INTO opportunity_analyses (id,user_id,opportunity_id,version,score,recommendation,strengths,gaps,risks,model_version,prompt_version) VALUES ('v1','a','oa','1','80','recommended','[]','[]','[]','m1','p1')",
      )
      .run();
    await db
      .prepare(
        "INSERT INTO opportunity_requirements (id,user_id,opportunity_id,analysis_id,text,kind,assessment,evidence_item_ids) VALUES ('r1','a','oa','v1','TypeScript','must','met','[\"ca\"]')",
      )
      .run();
    await db
      .prepare(
        "INSERT INTO opportunity_analysis_evidence (id,user_id,analysis_id,career_item_id) VALUES ('e1','a','v1','ca')",
      )
      .run();
    await db
      .prepare(
        "INSERT INTO opportunity_analysis_confirmations (id,user_id,analysis_id,correction_note) VALUES ('c1','a','v1','checked')",
      )
      .run();
    await assert.rejects(
      db
        .prepare(
          "INSERT INTO opportunity_analysis_confirmations (id,user_id,analysis_id,correction_note) VALUES ('c2','a','v1','again')",
        )
        .run(),
    );
    await assert.rejects(
      db
        .prepare(
          "INSERT INTO opportunity_requirements (id,user_id,opportunity_id,analysis_id,text,kind,assessment,evidence_item_ids) VALUES ('r2','b','oa','v1','X','must','met','[]')",
        )
        .run(),
    );
    await assert.rejects(
      db.prepare("UPDATE opportunity_analyses SET score='99' WHERE id='v1'").run(),
    );
    const version = await db
      .prepare("SELECT version, strengths FROM opportunity_analyses WHERE id='v1'")
      .first<{ version: string; strengths: string }>();
    assert.deepEqual(version, { version: "1", strengths: "[]" });
  } finally {
    await runtime.dispose();
  }
});
