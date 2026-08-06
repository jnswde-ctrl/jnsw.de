import { env } from "cloudflare:workers";
import { JobImportError, normalizeSuggestion } from "./job-import";

type ImportWorkerResponse = { suggestion?: unknown };

function importWorkerConfig() {
  const url = env.IMPORT_AI_WORKER_URL;
  const secret = env.IMPORT_AI_SHARED_SECRET;
  if (typeof url !== "string" || typeof secret !== "string" || !url || !secret)
    throw new JobImportError("Der KI-Import ist noch nicht konfiguriert.", 503);
  try {
    return { url: new URL(url).toString(), secret };
  } catch {
    throw new JobImportError("Der KI-Import ist noch nicht korrekt konfiguriert.", 503);
  }
}

export async function extractJobSuggestion(source: string, jobUrl: string | null) {
  const { url, secret } = importWorkerConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ source, jobUrl }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Import worker rejected request (${response.status})`);
    const result = (await response.json()) as ImportWorkerResponse;
    const suggestion = normalizeSuggestion(result.suggestion, jobUrl);
    if (!suggestion) throw new Error("Import worker returned invalid suggestion");
    return suggestion;
  } catch (error) {
    console.error("Job import worker failed", error);
    throw new JobImportError(
      "Die KI-Auswertung ist derzeit nicht verfügbar. Bitte versuche es später erneut.",
      503,
    );
  } finally {
    clearTimeout(timeout);
  }
}
