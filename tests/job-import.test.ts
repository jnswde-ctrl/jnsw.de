import assert from "node:assert/strict";
import test from "node:test";
import { fetchJobPage, normalizeSuggestion } from "../app/api/bewerbungswerkstatt/job-import.ts";

test("normalizes only complete, bounded job suggestions", () => {
  assert.deepEqual(normalizeSuggestion({ company: " Beispiel GmbH ", role: " Entwicklerin ", salary: "70.000 €", deadlineAt: "2026-09-01", notes: "Remote möglich" }, "https://jobs.example.org/a"), { company: "Beispiel GmbH", role: "Entwicklerin", salary: "70.000 €", deadlineAt: "2026-09-01", notes: "Remote möglich", jobUrl: "https://jobs.example.org/a" });
  assert.equal(normalizeSuggestion({ company: "Beispiel", role: "Rolle", deadlineAt: "morgen" }, null), null);
});

test("refuses local URLs instead of fetching them", async () => {
  await assert.rejects(() => fetchJobPage("http://127.0.0.1/private"), /kann nicht abgerufen/);
  await assert.rejects(() => fetchJobPage("https://localhost/jobs"), /kann nicht abgerufen/);
});
