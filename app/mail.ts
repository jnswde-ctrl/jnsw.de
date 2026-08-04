import { env } from "cloudflare:workers";

function requiredSecret(name: "MAILGUN_API_KEY" | "MAILGUN_DOMAIN" | "MAIL_FROM" | "MAILGUN_API_BASE_URL") {
  const value = env[name];
  if (typeof value !== "string" || !value) throw new Error(`Missing ${name}`);
  return value;
}

export async function sendVerificationEmail({ to, verificationUrl }: { to: string; verificationUrl: string }) {
  const apiKey = requiredSecret("MAILGUN_API_KEY");
  const domain = requiredSecret("MAILGUN_DOMAIN");
  const from = requiredSecret("MAIL_FROM");
  const baseUrl = requiredSecret("MAILGUN_API_BASE_URL").replace(/\/$/, "");
  const body = new FormData();
  body.set("from", `JNSW.DE <${from}>`);
  body.set("to", to);
  body.set("subject", "Bestätige deine E-Mail-Adresse für JNSW.DE");
  body.set("text", `Willkommen bei JNSW.DE. Bestätige deine E-Mail-Adresse innerhalb von 24 Stunden: ${verificationUrl}`);
  body.set("html", `<p>Willkommen bei JNSW.DE.</p><p><a href="${verificationUrl}">E-Mail-Adresse bestätigen</a></p><p>Dieser Link ist 24 Stunden gültig.</p>`);
  body.set("o:tracking", "no");
  body.set("o:require-tls", "yes");
  const response = await fetch(`${baseUrl}/v3/${encodeURIComponent(domain)}/messages`, { method: "POST", headers: { Authorization: `Basic ${btoa(`api:${apiKey}`)}` }, body });
  if (!response.ok) throw new Error(`Mailgun rejected the verification email (${response.status})`);
}
