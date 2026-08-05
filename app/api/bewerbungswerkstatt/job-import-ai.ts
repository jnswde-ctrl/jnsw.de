import { env } from "cloudflare:workers";
import { JobImportError, normalizeSuggestion } from "./job-import";

export async function extractJobSuggestion(source: string, jobUrl: string | null) {
  const ai = (env as unknown as { AI?: { run(model: string, input: Record<string, unknown>): Promise<{ response?: unknown }> } }).AI;
  if (!ai) throw new JobImportError("Workers AI ist für diese Umgebung noch nicht verfügbar.", 503);
  const schema = { type: "object", additionalProperties: false, required: ["company", "role", "salary", "deadlineAt", "notes"], properties: { company: { type: "string" }, role: { type: "string" }, salary: { type: ["string", "null"] }, deadlineAt: { type: ["string", "null"] }, notes: { type: "string" } } };
  try {
    const result = await ai.run("@cf/meta/llama-3.1-8b-instruct-fp8", { temperature: 0, max_tokens: 500, messages: [{ role: "system", content: "Extrahiere ausschließlich belegbare Angaben aus Stellenanzeigen. Erfinde nichts." }, { role: "user", content: `Extrahiere company und role. Nutze deadlineAt nur bei eindeutigem Datum im Format YYYY-MM-DD, sonst null. notes fasst Aufgaben, Anforderungen und Arbeitsort knapp zusammen.\n\n${source}` }], response_format: { type: "json_schema", json_schema: schema } });
    return normalizeSuggestion(result.response, jobUrl);
  } catch { throw new JobImportError("Die KI-Auswertung ist derzeit nicht verfügbar. Bitte versuche es später erneut.", 503); }
}
