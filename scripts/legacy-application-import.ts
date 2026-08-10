export const legacyApplicationStatuses = [
  "application_closed",
  "applied",
  "not_recommended",
  "rejected",
  "reviewed_hold",
  "status_unknown",
] as const;

export type LegacyApplicationStatus = (typeof legacyApplicationStatuses)[number];

export type LegacyApplication = {
  id: string;
  company: string;
  role: string;
  sourceUrl: string | null;
  reviewedAt: string | null;
  appliedAt: string | null;
  status: LegacyApplicationStatus;
  fitScore: number | null;
  notes: string;
  statusUpdatedAt?: string;
  documents?: string[];
  evidenceDocuments?: string[];
  privateReferenceCount?: number;
};

export type ExistingOpportunity = {
  sourceKey: string;
  company: string;
  role: string;
  jobUrl: string | null;
  sourceCheckedAt: string | null;
  listingStatus: string;
  reviewStatus: string;
  notes: string;
  application: { status: string; appliedAt: string | null } | null;
};

export type ImportRecord = {
  sourceKey: string;
  opportunity: {
    id: string;
    company: string;
    role: string;
    jobUrl: string | null;
    sourceCheckedAt: string | null;
    listingStatus: "unknown" | "closed";
    reviewStatus: "unreviewed" | "recommended" | "on_hold" | "not_recommended";
    notes: string;
    createdAt: string | null;
    updatedAt: string | null;
  };
  application: {
    id: string;
    status: "sent" | "rejected";
    appliedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  } | null;
  privateReferenceCount: number;
};

export type ImportReport = {
  new: number;
  updated: number;
  skipped: number;
  conflicts: number;
  privateReferences: number;
  unlinkedLetters: number;
  sourceStatusCounts: Record<LegacyApplicationStatus, number>;
};

const validStatuses = new Set<LegacyApplicationStatus>(legacyApplicationStatuses);

function isoTimestamp(value: string | null | undefined) {
  if (!value || Number.isNaN(Date.parse(value))) return null;
  return new Date(value).toISOString();
}

function statusMapping(item: LegacyApplication) {
  switch (item.status) {
    case "applied":
      return {
        listingStatus: "unknown" as const,
        reviewStatus: "recommended" as const,
        applicationStatus: "sent" as const,
      };
    case "rejected":
      return {
        listingStatus: "unknown" as const,
        reviewStatus: "recommended" as const,
        applicationStatus: "rejected" as const,
      };
    case "application_closed":
      return {
        listingStatus: "closed" as const,
        reviewStatus: item.appliedAt ? ("recommended" as const) : ("unreviewed" as const),
        applicationStatus: item.appliedAt ? ("sent" as const) : null,
      };
    case "not_recommended":
      return {
        listingStatus: "unknown" as const,
        reviewStatus: "not_recommended" as const,
        applicationStatus: null,
      };
    case "reviewed_hold":
      return {
        listingStatus: "unknown" as const,
        reviewStatus: "on_hold" as const,
        applicationStatus: null,
      };
    case "status_unknown":
      return {
        listingStatus: "unknown" as const,
        reviewStatus: "unreviewed" as const,
        applicationStatus: null,
      };
  }
}

export function toImportRecord(item: LegacyApplication): ImportRecord {
  if (!item.id || !item.company || !item.role || !validStatuses.has(item.status))
    throw new Error("Invalid legacy application record");
  if (item.sourceUrl && !URL.canParse(item.sourceUrl)) throw new Error("Invalid legacy source URL");
  const mapped = statusMapping(item);
  const reviewedAt = isoTimestamp(item.reviewedAt);
  const appliedAt = isoTimestamp(item.appliedAt);
  const updatedAt = isoTimestamp(item.statusUpdatedAt) ?? reviewedAt ?? appliedAt;
  const createdAt = appliedAt ?? reviewedAt ?? updatedAt;
  const opportunityId = `legacy-json:${item.id}`;
  return {
    sourceKey: opportunityId,
    opportunity: {
      id: opportunityId,
      company: item.company,
      role: item.role,
      jobUrl: item.sourceUrl,
      sourceCheckedAt: reviewedAt ?? updatedAt,
      listingStatus: mapped.listingStatus,
      reviewStatus: mapped.reviewStatus,
      notes: item.notes,
      createdAt,
      updatedAt,
    },
    application: mapped.applicationStatus
      ? {
          id: `legacy-json-application:${item.id}`,
          status: mapped.applicationStatus,
          appliedAt,
          createdAt,
          updatedAt,
        }
      : null,
    privateReferenceCount:
      item.privateReferenceCount ??
      (item.documents?.length ?? 0) + (item.evidenceDocuments?.length ?? 0),
  };
}

function equalOpportunity(record: ImportRecord, existing: ExistingOpportunity) {
  const value = record.opportunity;
  return (
    value.company === existing.company &&
    value.role === existing.role &&
    value.jobUrl === existing.jobUrl &&
    value.sourceCheckedAt === existing.sourceCheckedAt &&
    value.listingStatus === existing.listingStatus &&
    value.reviewStatus === existing.reviewStatus &&
    value.notes === existing.notes
  );
}

function equalApplication(record: ImportRecord, existing: ExistingOpportunity) {
  if (!record.application) return existing.application === null;
  return (
    existing.application !== null &&
    record.application.status === existing.application.status &&
    record.application.appliedAt === existing.application.appliedAt
  );
}

export function createImportPlan(
  applications: LegacyApplication[],
  existing: ExistingOpportunity[],
  unlinkedLetters = 0,
) {
  const report: ImportReport = {
    new: 0,
    updated: 0,
    skipped: 0,
    conflicts: 0,
    privateReferences: 0,
    unlinkedLetters,
    sourceStatusCounts: Object.fromEntries(
      legacyApplicationStatuses.map((status) => [status, 0]),
    ) as Record<LegacyApplicationStatus, number>,
  };
  const inserts: ImportRecord[] = [];
  const applicationBackfills: ImportRecord[] = [];
  const conflicts: string[] = [];
  const existingBySourceKey = new Map(existing.map((item) => [item.sourceKey, item]));
  const seen = new Set<string>();

  for (const source of applications) {
    const record = toImportRecord(source);
    report.sourceStatusCounts[source.status]++;
    report.privateReferences += record.privateReferenceCount;
    if (seen.has(record.sourceKey)) {
      report.conflicts++;
      conflicts.push(record.sourceKey);
      continue;
    }
    seen.add(record.sourceKey);
    const current = existingBySourceKey.get(record.sourceKey);
    if (!current) {
      report.new++;
      inserts.push(record);
      continue;
    }
    if (!equalOpportunity(record, current) || (current.application && !record.application)) {
      report.conflicts++;
      conflicts.push(record.sourceKey);
      continue;
    }
    if (!equalApplication(record, current)) {
      if (record.application && !current.application) {
        report.updated++;
        applicationBackfills.push(record);
      } else {
        report.conflicts++;
        conflicts.push(record.sourceKey);
      }
      continue;
    }
    report.skipped++;
  }
  return { inserts, applicationBackfills, conflicts, report };
}
