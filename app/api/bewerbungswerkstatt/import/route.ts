import { activeUser, denied, json, mutationAllowed, privateHeaders, text } from "../support";
import { fetchJobPage, JobImportError } from "../job-import";
import { extractJobSuggestion } from "../job-import-ai";

export async function POST(request: Request) {
  if (!mutationAllowed(request)) return denied(403, "Invalid origin");
  if (!(await activeUser())) return denied(401, "Authentication required");
  const body = await json(request),
    url = text(body?.url, 2048),
    manualText = text(body?.text, 20_000);
  if (!url && !manualText)
    return denied(400, "Füge eine Stellenanzeigen-URL oder einen Beschreibungstext ein.");
  try {
    const source = manualText || (await fetchJobPage(url!));
    const suggestion = await extractJobSuggestion(source, url || null);
    return suggestion
      ? Response.json({ suggestion }, { headers: privateHeaders })
      : denied(
          422,
          "Die KI konnte keine vollständigen Stellendaten erkennen. Ergänze oder korrigiere den Beschreibungstext.",
        );
  } catch (error) {
    return denied(
      error instanceof JobImportError ? error.status : 422,
      error instanceof Error ? error.message : "Der Import ist fehlgeschlagen.",
    );
  }
}
