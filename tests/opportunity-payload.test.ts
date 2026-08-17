import assert from "node:assert/strict";
import test from "node:test";
import { importedOpportunityPayload } from "../app/community/bewerbungswerkstatt/opportunity-payload";

test("creates an import opportunity payload instead of a legacy application payload", () => {
  const fields = new FormData();
  fields.set("company", "Example GmbH");
  fields.set("role", "Developer");
  fields.set("advertisedSalary", "60.000 €");

  assert.deepEqual(
    importedOpportunityPayload(fields, "import:example", "2026-08-10T12:00:00.000Z"),
    {
      company: "Example GmbH",
      role: "Developer",
      advertisedSalary: "60.000 €",
      sourceKey: "import:example",
      sourceType: "import",
      sourceCheckedAt: "2026-08-10T12:00:00.000Z",
    },
  );
});
