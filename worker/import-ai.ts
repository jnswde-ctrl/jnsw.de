interface Env {
  AI: { run(model: string, input: Record<string, unknown>): Promise<{ response?: unknown }> };
  IMPORT_AI_SHARED_SECRET: string;
}

type ImportRequest = { source: string; jobUrl: string | null };

function parseSuggestion(raw: unknown) {
  if (typeof raw !== "string") return null;
  const json = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(json) as unknown;
}

export async function importRequest(request: Request): Promise<ImportRequest | null> {
  if (request.method !== "POST") return null;
  const body = (await request.json().catch(() => null)) as { source?: unknown; jobUrl?: unknown } | null;
  if (typeof body?.source !== "string" || !body.source.trim() || body.source.length > 20_000) return null;
  if (body.jobUrl !== null && typeof body?.jobUrl !== "string") return null;
  return { source: body.source, jobUrl: body.jobUrl };
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.headers.get("Authorization") !== `Bearer ${env.IMPORT_AI_SHARED_SECRET}`) return new Response("Unauthorized", { status: 401 });
    const input = await importRequest(request);
    if (!input) return new Response("Invalid import request", { status: 400 });
    try {
      const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fp8", {
        temperature: 0, max_tokens: 500,
        messages: [{ role: "system", content: "Extrahiere ausschließlich belegbare Angaben aus Stellenanzeigen. Erfinde nichts. Antworte ausschließlich mit einem JSON-Objekt ohne Markdown: {\"company\":string,\"role\":string,\"salary\":string|null,\"deadlineAt\":\"YYYY-MM-DD\"|null,\"notes\":string}." }, { role: "user", content: `Extrahiere company und role. Nutze deadlineAt nur bei eindeutigem Datum im Format YYYY-MM-DD, sonst null. notes fasst Aufgaben, Anforderungen und Arbeitsort knapp zusammen.\n\n${input.source}` }],
      });
      const suggestion = parseSuggestion(result.response);
      return Response.json({ suggestion }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      console.error("Workers AI import failed", error);
      return new Response("AI import unavailable", { status: 503 });
    }
  },
};

export default worker;
