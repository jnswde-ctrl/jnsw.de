import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  createImportPlan,
  sqlForPlan,
  type ExistingOpportunity,
  type LegacyApplication,
} from "./legacy-application-import";

const execute = promisify(execFile);

type LegacySource = { applications: LegacyApplication[] };
type LetterSource = { jobs: unknown[] };

function option(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function usage(message?: string): never {
  if (message) console.error(message);
  console.error(
    "Usage: npx tsx scripts/import-legacy-applications.mts --applications <path> --user-id <id> [--letters <path>] [--remote] [--apply]",
  );
  process.exit(1);
}

async function d1Query(database: string, userId: string, remote: boolean) {
  const { stdout } = await execute("npx", [
    "wrangler",
    "d1",
    "execute",
    database,
    remote ? "--remote" : "--local",
    "--json",
    "--command",
    `SELECT o.source_key AS sourceKey, o.company, o.role, o.job_url AS jobUrl, o.source_checked_at AS sourceCheckedAt, o.listing_status AS listingStatus, o.review_status AS reviewStatus, o.notes, a.status AS applicationStatus, a.applied_at AS appliedAt FROM job_opportunities o LEFT JOIN job_applications a ON a.opportunity_id = o.id AND a.user_id = o.user_id WHERE o.user_id = '${userId.replaceAll("'", "''")}' AND o.source_key LIKE 'legacy-json:%';`,
  ]);
  const result = JSON.parse(stdout) as Array<{ results?: Array<Record<string, unknown>> }>;
  return (result[0]?.results ?? []).map((row) => ({
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
  })) satisfies ExistingOpportunity[];
}

const applicationsPath = option("--applications");
const userId = option("--user-id");
if (!applicationsPath || !userId) usage("Missing required option.");
const apply = process.argv.includes("--apply");
const remote = process.argv.includes("--remote");
const database = option("--database") ?? "DB";
const applications = JSON.parse(await readFile(applicationsPath, "utf8")) as LegacySource;
if (!Array.isArray(applications.applications))
  usage("The applications source has no applications array.");
const lettersPath = option("--letters");
const letters = lettersPath
  ? (JSON.parse(await readFile(lettersPath, "utf8")) as LetterSource)
  : null;
const existing = await d1Query(database, userId, remote);
const plan = createImportPlan(applications.applications, existing, letters?.jobs.length ?? 0);
console.log(JSON.stringify({ ...plan.report, conflictKeys: plan.conflicts.map(() => "redacted") }));
if (!apply || plan.conflicts.length) process.exit(plan.conflicts.length ? 2 : 0);

const directory = await mkdtemp(join(tmpdir(), "jnsw-legacy-import-"));
const sqlPath = join(directory, "import.sql");
try {
  await writeFile(sqlPath, sqlForPlan(plan, userId), "utf8");
  await execute("npx", [
    "wrangler",
    "d1",
    "execute",
    database,
    remote ? "--remote" : "--local",
    "--yes",
    "--file",
    sqlPath,
  ]);
  console.log(JSON.stringify({ applied: plan.report.new + plan.report.updated }));
} finally {
  await rm(directory, { recursive: true, force: true });
}
