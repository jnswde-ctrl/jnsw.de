import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps the production and local D1 bindings separate", async () => {
  const [hosting, wrangler] = await Promise.all([
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"),
  ]);
  const hostingConfig = JSON.parse(hosting);
  const wranglerConfig = JSON.parse(wrangler.replace(/,\s*([}\]])/g, "$1"));
  const localDatabase = wranglerConfig.d1_databases.find(
    (item: { binding: string }) => item.binding === "DB",
  ) as { database_name: string; database_id?: string; preview_database_id?: string } | undefined;

  assert.equal(hostingConfig.d1, "DB");
  assert.ok(localDatabase);
  assert.equal(localDatabase.database_name, "jnswde-local");
  assert.equal("database_id" in localDatabase, false);
  assert.equal("preview_database_id" in localDatabase, false);
});
