export type JobImportSuggestion = { company: string; role: string; jobUrl: string | null; salary: string | null; deadlineAt: string | null; notes: string };
export class JobImportError extends Error { constructor(message: string, readonly status = 422) { super(message); } }

const maxSourceLength = 20_000;
const invalidHosts = /(^|\.)(localhost|local|internal|test|example|invalid)$/i;
const privateIp = /^(?:0|127|10|192\.168|169\.254|172\.(?:1[6-9]|2\d|3[01]))(?:\.|$)|^\[?(?::1|fc|fd|fe80)/i;

export function normalizeSuggestion(value: unknown, jobUrl: string | null): JobImportSuggestion | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  const text = (name: string, maximum: number, required = false) => typeof data[name] === "string" && data[name].trim().length <= maximum && (!required || data[name].trim()) ? data[name].trim() : null;
  const date = text("deadlineAt", 10);
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const company = text("company", 160, true), role = text("role", 160, true), salary = text("salary", 120), notes = text("notes", 8_000) ?? "";
  return company && role ? { company, role, jobUrl, salary, deadlineAt: date, notes } : null;
}

function readableText(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<[^>]+>/gi, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim().slice(0, maxSourceLength);
}

export async function fetchJobPage(rawUrl: string) {
  let url: URL;
  try { url = new URL(rawUrl); } catch { throw new Error("Die URL ist ungültig. Füge stattdessen den Beschreibungstext ein."); }
  let response: Response;
  for (let redirects = 0; redirects < 4; redirects++) {
    if ((url.protocol !== "https:" && url.protocol !== "http:") || invalidHosts.test(url.hostname) || privateIp.test(url.hostname)) throw new Error("Diese URL kann nicht abgerufen werden. Füge stattdessen den Beschreibungstext ein.");
    try { response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(10_000), headers: { Accept: "text/html, text/plain;q=0.9" } }); } catch { throw new Error("Die Stellenanzeige konnte nicht abgerufen werden. Füge stattdessen den Beschreibungstext ein."); }
    if (response.status < 300 || response.status > 399) break;
    const location = response.headers.get("location");
    if (!location) throw new Error("Die Stellenanzeige konnte nicht gelesen werden. Füge stattdessen den Beschreibungstext ein.");
    url = new URL(location, url);
  }
  if (!response!) throw new Error("Die Stellenanzeige konnte nicht gelesen werden. Füge stattdessen den Beschreibungstext ein.");
  if (!response.ok || !/^text\/(html|plain)/i.test(response.headers.get("content-type") ?? "")) throw new Error("Die Stellenanzeige konnte nicht gelesen werden. Füge stattdessen den Beschreibungstext ein.");
  const content = readableText((await response.text()).slice(0, maxSourceLength * 3));
  if (!content) throw new Error("Die Stellenanzeige enthält keinen lesbaren Text. Füge stattdessen den Beschreibungstext ein.");
  return content;
}
