import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from ".";
import { addTimelineEvent, type ApplicationStatus } from "./applications";
import {
  jobApplications,
  jobOpportunities,
  opportunityAnalyses,
  opportunityTimelineEvents,
  type opportunityListingStatusValues,
  type opportunityRemoteModelValues,
  type opportunityReviewStatusValues,
  type opportunitySourceTypeValues,
} from "./schema";
import {
  canTransitionOpportunityReviewStatus,
  opportunityListingStatusLabels,
  opportunityReviewStatusLabels,
  requiresOpportunityAnalysis,
} from "./workflow";

export type OpportunitySourceType = (typeof opportunitySourceTypeValues)[number];
export type OpportunityRemoteModel = (typeof opportunityRemoteModelValues)[number];
export type OpportunityListingStatus = (typeof opportunityListingStatusValues)[number];
export type OpportunityReviewStatus = (typeof opportunityReviewStatusValues)[number];
export type OpportunityResult<T> =
  | { kind: "ok"; value: T }
  | { kind: "not_found" }
  | { kind: "invalid_transition" }
  | { kind: "analysis_required" }
  | { kind: "already_converted"; application: typeof jobApplications.$inferSelect };

const now = () => new Date().toISOString();

export async function listOpportunities(userId: string) {
  return getDb()
    .select()
    .from(jobOpportunities)
    .where(and(eq(jobOpportunities.userId, userId), isNull(jobOpportunities.archivedAt)))
    .orderBy(desc(jobOpportunities.updatedAt));
}

export async function opportunityDetail(userId: string, id: string) {
  const opportunity = await getDb().query.jobOpportunities.findFirst({
    where: and(eq(jobOpportunities.id, id), eq(jobOpportunities.userId, userId)),
  });
  if (!opportunity) return null;
  const [timeline, application] = await Promise.all([
    getDb()
      .select()
      .from(opportunityTimelineEvents)
      .where(
        and(
          eq(opportunityTimelineEvents.opportunityId, id),
          eq(opportunityTimelineEvents.userId, userId),
        ),
      )
      .orderBy(desc(opportunityTimelineEvents.occurredAt)),
    getDb().query.jobApplications.findFirst({
      where: and(eq(jobApplications.opportunityId, id), eq(jobApplications.userId, userId)),
    }),
  ]);
  return { opportunity, timeline, application: application ?? null };
}

export async function createOpportunity(
  userId: string,
  data: Pick<
    typeof jobOpportunities.$inferInsert,
    | "sourceKey"
    | "sourceType"
    | "company"
    | "role"
    | "jobUrl"
    | "location"
    | "remoteModel"
    | "advertisedSalary"
    | "deadlineAt"
    | "applicationMethod"
    | "sourceCheckedAt"
    | "listingStatus"
    | "reviewStatus"
    | "notes"
  >,
) {
  const [opportunity] = await getDb()
    .insert(jobOpportunities)
    .values({ id: crypto.randomUUID(), userId, ...data })
    .returning();
  await addOpportunityTimelineEvent(userId, opportunity.id, "created", now(), "Stelle erfasst.");
  return opportunity;
}

export async function updateOpportunity(
  userId: string,
  id: string,
  changes: Partial<
    Pick<
      typeof jobOpportunities.$inferInsert,
      | "company"
      | "role"
      | "jobUrl"
      | "location"
      | "remoteModel"
      | "advertisedSalary"
      | "deadlineAt"
      | "applicationMethod"
      | "sourceCheckedAt"
      | "listingStatus"
      | "reviewStatus"
      | "notes"
      | "archivedAt"
    >
  >,
): Promise<OpportunityResult<typeof jobOpportunities.$inferSelect>> {
  const current = await getDb().query.jobOpportunities.findFirst({
    where: and(eq(jobOpportunities.id, id), eq(jobOpportunities.userId, userId)),
  });
  if (!current) return { kind: "not_found" };
  if (
    changes.reviewStatus &&
    !canTransitionOpportunityReviewStatus(current.reviewStatus, changes.reviewStatus)
  )
    return { kind: "invalid_transition" };
  if (
    changes.reviewStatus &&
    requiresOpportunityAnalysis(changes.reviewStatus) &&
    !(await hasOpportunityAnalysis(userId, id))
  )
    return { kind: "analysis_required" };
  const [opportunity] = await getDb()
    .update(jobOpportunities)
    .set({ ...changes, updatedAt: now() })
    .where(and(eq(jobOpportunities.id, id), eq(jobOpportunities.userId, userId)))
    .returning();
  if (changes.reviewStatus && changes.reviewStatus !== current.reviewStatus)
    await addOpportunityTimelineEvent(
      userId,
      id,
      "review_status_changed",
      now(),
      `Prüfstatus: ${opportunityReviewStatusLabels[current.reviewStatus]} → ${opportunityReviewStatusLabels[changes.reviewStatus]}.`,
    );
  if (changes.listingStatus && changes.listingStatus !== current.listingStatus)
    await addOpportunityTimelineEvent(
      userId,
      id,
      "source_checked",
      now(),
      `Quellenstatus: ${opportunityListingStatusLabels[current.listingStatus]} → ${opportunityListingStatusLabels[changes.listingStatus]}.`,
    );
  if (changes.archivedAt && !current.archivedAt)
    await addOpportunityTimelineEvent(userId, id, "archived", now(), "Stelle archiviert.");
  return { kind: "ok", value: opportunity };
}

export async function convertOpportunityToApplication(
  userId: string,
  opportunityId: string,
): Promise<OpportunityResult<typeof jobApplications.$inferSelect>> {
  const opportunity = await getDb().query.jobOpportunities.findFirst({
    where: and(eq(jobOpportunities.id, opportunityId), eq(jobOpportunities.userId, userId)),
  });
  if (!opportunity) return { kind: "not_found" };
  if (
    opportunity.reviewStatus !== "recommended" ||
    !(await hasOpportunityAnalysis(userId, opportunityId))
  )
    return { kind: "analysis_required" };
  const existing = await getDb().query.jobApplications.findFirst({
    where: and(
      eq(jobApplications.opportunityId, opportunityId),
      eq(jobApplications.userId, userId),
    ),
  });
  if (existing) return { kind: "already_converted", application: existing };
  try {
    const [application] = await getDb()
      .insert(jobApplications)
      .values({
        id: crypto.randomUUID(),
        userId,
        opportunityId,
        company: opportunity.company,
        role: opportunity.role,
        jobUrl: opportunity.jobUrl,
        deadlineAt: opportunity.deadlineAt,
        applicationMethod: opportunity.applicationMethod,
        notes: opportunity.notes,
        status: "draft" satisfies ApplicationStatus,
      })
      .returning();
    await Promise.all([
      addTimelineEvent(userId, application.id, "created", now(), "Bewerbung aus Stelle angelegt."),
      addOpportunityTimelineEvent(
        userId,
        opportunityId,
        "converted_to_application",
        now(),
        "In Bewerbung überführt.",
      ),
    ]);
    return { kind: "ok", value: application };
  } catch {
    const concurrent = await getDb().query.jobApplications.findFirst({
      where: and(
        eq(jobApplications.opportunityId, opportunityId),
        eq(jobApplications.userId, userId),
      ),
    });
    if (concurrent) return { kind: "already_converted", application: concurrent };
    throw new Error("Unable to convert opportunity to application");
  }
}

async function hasOpportunityAnalysis(userId: string, opportunityId: string) {
  return Boolean(
    await getDb().query.opportunityAnalyses.findFirst({
      where: and(
        eq(opportunityAnalyses.userId, userId),
        eq(opportunityAnalyses.opportunityId, opportunityId),
      ),
    }),
  );
}

export async function deleteOpportunity(userId: string, id: string) {
  const result = await getDb()
    .delete(jobOpportunities)
    .where(and(eq(jobOpportunities.id, id), eq(jobOpportunities.userId, userId)))
    .returning({ id: jobOpportunities.id });
  return result[0];
}

export async function addOpportunityTimelineEvent(
  userId: string,
  opportunityId: string,
  type: string,
  occurredAt: string,
  note: string,
) {
  const [event] = await getDb()
    .insert(opportunityTimelineEvents)
    .values({ id: crypto.randomUUID(), userId, opportunityId, type, occurredAt, note })
    .returning();
  return event;
}
