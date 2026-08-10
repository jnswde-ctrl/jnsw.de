import { env } from "cloudflare:workers";
import {
  createImportPlan,
  type ExistingOpportunity,
  type LegacyApplication,
} from "../../../../scripts/legacy-application-import";
import { activeUser, denied, json, mutationAllowed, privateHeaders } from "../support";

const statuses = new Set<LegacyApplication["status"]>([
  "application_closed",
  "applied",
  "not_recommended",
  "rejected",
  "reviewed_hold",
  "status_unknown",
]);

function string(value: unknown, max: number, required = false) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) return null;
  return value.trim();
}

function nullableString(value: unknown, max: number) {
  return value === null || value === undefined || value === "" ? null : string(value, max);
}

function legacyApplications(value: unknown): LegacyApplication[] | null {
  if (!Array.isArray(value) || value.length > 100) return null;
  const records: LegacyApplication[] = [];
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") return null;
    const item = candidate as Record<string, unknown>;
    const id = string(item.id, 120, true);
    const company = string(item.company, 160, true);
    const role = string(item.role, 160, true);
    const sourceUrl = nullableString(item.sourceUrl, 2048);
    const reviewedAt = nullableString(item.reviewedAt, 64);
    const appliedAt = nullableString(item.appliedAt, 64);
    const notes = string(item.notes, 8000) ?? "";
    const status = item.status;
    const privateReferenceCount =
      typeof item.privateReferenceCount === "number" ? item.privateReferenceCount : -1;
    if (
      !id ||
      !company ||
      !role ||
      (item.sourceUrl !== null && item.sourceUrl !== undefined && !sourceUrl) ||
      (item.reviewedAt !== null && item.reviewedAt !== undefined && !reviewedAt) ||
      (item.appliedAt !== null && item.appliedAt !== undefined && !appliedAt) ||
      typeof status !== "string" ||
      !statuses.has(status as LegacyApplication["status"]) ||
      !Number.isInteger(privateReferenceCount) ||
      privateReferenceCount < 0 ||
      privateReferenceCount > 100
    )
      return null;
    records.push({
      id,
      company,
      role,
      sourceUrl,
      reviewedAt,
      appliedAt,
      status: status as LegacyApplication["status"],
      fitScore: null,
      notes,
      statusUpdatedAt: nullableString(item.statusUpdatedAt, 64) ?? undefined,
      privateReferenceCount,
    });
  }
  return records;
}

async function existingLegacyOpportunities(userId: string): Promise<ExistingOpportunity[]> {
  const result = await env.DB.prepare(
    `SELECT o.source_key AS sourceKey, o.company, o.role, o.job_url AS jobUrl,
      o.source_checked_at AS sourceCheckedAt, o.listing_status AS listingStatus,
      o.review_status AS reviewStatus, o.notes, a.status AS applicationStatus,
      a.applied_at AS appliedAt
    FROM job_opportunities o
    LEFT JOIN job_applications a ON a.opportunity_id = o.id AND a.user_id = o.user_id
    WHERE o.user_id = ? AND o.source_key LIKE 'legacy-json:%'`,
  )
    .bind(userId)
    .all();
  return (result.results as Array<Record<string, unknown>>).map((row) => ({
    sourceKey: String(row.sourceKey),
    company: String(row.company),
    role: String(row.role),
    jobUrl: (row.jobUrl as string | null) ?? null,
    sourceCheckedAt: (row.sourceCheckedAt as string | null) ?? null,
    listingStatus: String(row.listingStatus),
    reviewStatus: String(row.reviewStatus),
    notes: String(row.notes),
    application: row.applicationStatus
      ? {
          status: String(row.applicationStatus),
          appliedAt: (row.appliedAt as string | null) ?? null,
        }
      : null,
  }));
}

export async function POST(request: Request) {
  if (!mutationAllowed(request)) return denied(403, "Unzulaessige Herkunft der Anfrage.");
  const user = await activeUser();
  if (!user) return denied(401, "Anmeldung erforderlich.");
  const body = await json(request);
  const applications = legacyApplications(body?.applications);
  const mode = body?.mode;
  const unlinkedLetters = typeof body?.unlinkedLetters === "number" ? body.unlinkedLetters : -1;
  if (!applications || (mode !== "dry-run" && mode !== "apply"))
    return denied(400, "Die Importdatei hat kein unterstuetztes Format.");
  if (!Number.isInteger(unlinkedLetters) || unlinkedLetters < 0 || unlinkedLetters > 100)
    return denied(400, "Ungueltige Anzahl nicht zuordenbarer Anschreiben.");

  let plan: ReturnType<typeof createImportPlan>;
  try {
    plan = createImportPlan(
      applications,
      await existingLegacyOpportunities(user.id),
      unlinkedLetters,
    );
  } catch {
    return denied(400, "Die Importdatei enthaelt ungueltige Bewerbungsdaten.");
  }
  if (mode === "dry-run")
    return Response.json({ report: plan.report }, { headers: privateHeaders });
  if (plan.conflicts.length)
    return denied(409, "Der Bestand wurde seit dem Probelauf veraendert. Bitte erneut pruefen.");

  const statements = [];
  for (const record of plan.inserts) {
    const value = record.opportunity;
    statements.push(
      env.DB.prepare(
        `INSERT INTO job_opportunities (id, user_id, source_key, source_type, company, role, job_url, source_checked_at, listing_status, review_status, notes, created_at, updated_at)
         VALUES (?, ?, ?, 'import', ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))`,
      ).bind(
        value.id,
        user.id,
        record.sourceKey,
        value.company,
        value.role,
        value.jobUrl,
        value.sourceCheckedAt,
        value.listingStatus,
        value.reviewStatus,
        value.notes,
        value.createdAt,
        value.updatedAt,
      ),
    );
    if (record.application) {
      const application = record.application;
      statements.push(
        env.DB.prepare(
          `INSERT INTO job_applications (id, user_id, opportunity_id, company, role, job_url, applied_at, status, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))`,
        ).bind(
          application.id,
          user.id,
          value.id,
          value.company,
          value.role,
          value.jobUrl,
          application.appliedAt,
          application.status,
          value.notes,
          application.createdAt,
          application.updatedAt,
        ),
      );
    }
  }
  for (const record of plan.applicationBackfills) {
    const application = record.application!;
    const value = record.opportunity;
    statements.push(
      env.DB.prepare(
        `INSERT INTO job_applications (id, user_id, opportunity_id, company, role, job_url, applied_at, status, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))`,
      ).bind(
        application.id,
        user.id,
        value.id,
        value.company,
        value.role,
        value.jobUrl,
        application.appliedAt,
        application.status,
        value.notes,
        application.createdAt,
        application.updatedAt,
      ),
    );
  }
  if (statements.length) await env.DB.batch(statements);
  return Response.json({ report: plan.report, applied: true }, { headers: privateHeaders });
}
