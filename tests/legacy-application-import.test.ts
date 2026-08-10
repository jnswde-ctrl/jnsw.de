import assert from "node:assert/strict";
import test from "node:test";
import {
  createImportPlan,
  toImportRecord,
  type LegacyApplication,
} from "../scripts/legacy-application-import";

const applied: LegacyApplication = {
  id: "legacy-1",
  company: "Example GmbH",
  role: "Developer",
  sourceUrl: "https://example.test/jobs/1",
  reviewedAt: "2026-08-01T10:00:00Z",
  appliedAt: "2026-08-02T10:00:00Z",
  status: "applied",
  fitScore: 8,
  notes: "Private note",
};

test("maps legacy states onto independent opportunity and application states", () => {
  assert.deepEqual(toImportRecord({ ...applied, status: "application_closed" }).opportunity, {
    id: "legacy-json:legacy-1",
    company: "Example GmbH",
    role: "Developer",
    jobUrl: "https://example.test/jobs/1",
    sourceCheckedAt: "2026-08-01T10:00:00.000Z",
    listingStatus: "closed",
    reviewStatus: "recommended",
    notes: "Private note",
    createdAt: "2026-08-02T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  });
  assert.equal(
    toImportRecord({ ...applied, status: "not_recommended", appliedAt: null }).application,
    null,
  );
  assert.equal(
    toImportRecord({ ...applied, status: "rejected", appliedAt: null }).application?.status,
    "rejected",
  );
});

test("is idempotent and reports mismatches without scheduling writes for them", () => {
  const first = createImportPlan([applied], []);
  assert.equal(first.report.new, 1);
  const record = toImportRecord(applied);
  const existing = [
    {
      sourceKey: record.sourceKey,
      company: record.opportunity.company,
      role: record.opportunity.role,
      jobUrl: record.opportunity.jobUrl,
      sourceCheckedAt: record.opportunity.sourceCheckedAt,
      listingStatus: record.opportunity.listingStatus,
      reviewStatus: record.opportunity.reviewStatus,
      notes: record.opportunity.notes,
      application: { status: "sent", appliedAt: record.application?.appliedAt ?? null },
    },
  ];
  const repeated = createImportPlan([applied], existing);
  assert.deepEqual(repeated.report, {
    new: 0,
    updated: 0,
    skipped: 1,
    conflicts: 0,
    privateReferences: 0,
    unlinkedLetters: 0,
    sourceStatusCounts: {
      application_closed: 0,
      applied: 1,
      not_recommended: 0,
      rejected: 0,
      reviewed_hold: 0,
      status_unknown: 0,
    },
  });
  const conflict = createImportPlan([applied], [{ ...existing[0], company: "Different GmbH" }]);
  assert.equal(conflict.report.conflicts, 1);
  assert.equal(
    createImportPlan([applied], [{ ...existing[0], notes: "Changed private note" }]).report
      .conflicts,
    1,
  );
  assert.equal(conflict.inserts.length, 0);
  assert.equal(conflict.applicationBackfills.length, 0);
});

test("reports every legacy status group without exposing application data", () => {
  const plan = createImportPlan(
    [
      { ...applied, status: "applied" },
      { ...applied, id: "legacy-2", status: "rejected" },
      { ...applied, id: "legacy-3", status: "status_unknown", appliedAt: null },
    ],
    [],
  );
  assert.deepEqual(plan.report.sourceStatusCounts, {
    application_closed: 0,
    applied: 1,
    not_recommended: 0,
    rejected: 1,
    reviewed_hold: 0,
    status_unknown: 1,
  });
  assert.equal(JSON.stringify(plan.report.sourceStatusCounts).includes("Example GmbH"), false);
});

test("keeps document references out of the import payload while counting them", () => {
  const plan = createImportPlan(
    [{ ...applied, documents: ["private.pdf"], evidenceDocuments: ["cv.pdf"] }],
    [],
    3,
  );
  assert.equal(plan.report.privateReferences, 2);
  assert.equal(plan.report.unlinkedLetters, 3);
  assert.equal(JSON.stringify(plan.report).includes("private.pdf"), false);
});
