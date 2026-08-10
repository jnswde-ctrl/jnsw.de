import { and, desc, eq, inArray, isNotNull, ne } from "drizzle-orm";
import { getDb } from ".";
import {
  applicationDocumentVersions,
  applicationEvidence,
  applicationTimelineEvents,
  careerItems,
  jobApplications,
  opportunityAnalyses,
  type applicationStatusValues,
  type careerItemKindValues,
} from "./schema";
import { listAttachments } from "./application-attachments";
import {
  type ApplicationDocumentStatus,
  type ApplicationDocumentType,
  nextDocumentVersion,
} from "./application-documents";
import {
  applicationStatusLabels,
  canTransitionApplicationStatus,
  nextApplicationAction,
} from "./workflow";

export type ApplicationStatus = (typeof applicationStatusValues)[number];
export type CareerItemKind = (typeof careerItemKindValues)[number];
const now = () => new Date().toISOString();

export async function listApplications(userId: string) {
  return getDb()
    .select()
    .from(jobApplications)
    .where(and(eq(jobApplications.userId, userId), ne(jobApplications.status, "archived")))
    .orderBy(desc(jobApplications.updatedAt));
}
export async function dashboard(userId: string) {
  const applications = await listApplications(userId);
  const today = new Date().toISOString().slice(0, 10);
  const actions = applications
    .map((application) => {
      const action = nextApplicationAction(application, today);
      return action ? { application, ...action } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort(
      (a, b) =>
        a.priority - b.priority || (a.date ?? "9999-12-31").localeCompare(b.date ?? "9999-12-31"),
    );
  return {
    applications,
    actions,
    monthlyCount: applications.filter((item) => item.createdAt.startsWith(today.slice(0, 7)))
      .length,
  };
}
export async function createApplication(
  userId: string,
  data: Pick<
    typeof jobApplications.$inferInsert,
    "company" | "role" | "jobUrl" | "salary" | "deadlineAt" | "status" | "notes" | "followUpAt"
  >,
) {
  const [item] = await getDb()
    .insert(jobApplications)
    .values({ id: crypto.randomUUID(), userId, ...data })
    .returning();
  await addTimelineEvent(userId, item.id, "created", now(), "Bewerbung angelegt.");
  return item;
}
export async function updateApplication(
  userId: string,
  id: string,
  changes: Partial<
    Pick<
      typeof jobApplications.$inferInsert,
      | "company"
      | "role"
      | "jobUrl"
      | "salary"
      | "deadlineAt"
      | "status"
      | "notes"
      | "followUpAt"
      | "applicationMethod"
      | "appliedAt"
      | "archivedAt"
    >
  >,
) {
  const current = await getDb().query.jobApplications.findFirst({
    where: and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)),
  });
  if (!current) return { kind: "not_found" as const };
  if (changes.status && !canTransitionApplicationStatus(current.status, changes.status))
    return { kind: "invalid_transition" as const };
  const [item] = await getDb()
    .update(jobApplications)
    .set({ ...changes, updatedAt: now() })
    .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)))
    .returning();
  if (changes.status && changes.status !== current.status)
    await addTimelineEvent(
      userId,
      id,
      "status_changed",
      now(),
      `Bewerbungsstatus: ${applicationStatusLabels[current.status]} → ${applicationStatusLabels[changes.status]}.`,
    );
  return { kind: "ok" as const, value: item };
}
export async function deleteApplication(userId: string, id: string) {
  const result = await getDb()
    .delete(jobApplications)
    .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)))
    .returning({ id: jobApplications.id });
  return result[0];
}
export async function listCareerItems(userId: string) {
  return getDb()
    .select()
    .from(careerItems)
    .where(eq(careerItems.userId, userId))
    .orderBy(desc(careerItems.updatedAt));
}
export async function createCareerItem(
  userId: string,
  data: Pick<
    typeof careerItems.$inferInsert,
    "kind" | "title" | "organization" | "description" | "link"
  >,
) {
  const [item] = await getDb()
    .insert(careerItems)
    .values({ id: crypto.randomUUID(), userId, ...data })
    .returning();
  return item;
}
export async function updateCareerItem(
  userId: string,
  id: string,
  changes: Partial<
    Pick<
      typeof careerItems.$inferInsert,
      "kind" | "title" | "organization" | "description" | "link"
    >
  >,
) {
  const [item] = await getDb()
    .update(careerItems)
    .set({ ...changes, updatedAt: now() })
    .where(and(eq(careerItems.id, id), eq(careerItems.userId, userId)))
    .returning();
  return item;
}
export async function deleteCareerItem(userId: string, id: string) {
  const result = await getDb()
    .delete(careerItems)
    .where(and(eq(careerItems.id, id), eq(careerItems.userId, userId)))
    .returning({ id: careerItems.id });
  return result[0];
}
export async function addTimelineEvent(
  userId: string,
  applicationId: string,
  type: string,
  occurredAt: string,
  note: string,
) {
  const [item] = await getDb()
    .insert(applicationTimelineEvents)
    .values({ id: crypto.randomUUID(), userId, applicationId, type, occurredAt, note })
    .returning();
  return item;
}
export async function applicationDetail(userId: string, id: string) {
  const app = await getDb().query.jobApplications.findFirst({
    where: and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)),
  });
  if (!app) return null;
  const [evidence, documents, timeline, attachments] = await Promise.all([
    getDb()
      .select()
      .from(applicationEvidence)
      .where(
        and(eq(applicationEvidence.applicationId, id), eq(applicationEvidence.userId, userId)),
      ),
    getDb()
      .select()
      .from(applicationDocumentVersions)
      .where(
        and(
          eq(applicationDocumentVersions.applicationId, id),
          eq(applicationDocumentVersions.userId, userId),
        ),
      )
      .orderBy(desc(applicationDocumentVersions.createdAt)),
    getDb()
      .select()
      .from(applicationTimelineEvents)
      .where(
        and(
          eq(applicationTimelineEvents.applicationId, id),
          eq(applicationTimelineEvents.userId, userId),
        ),
      )
      .orderBy(desc(applicationTimelineEvents.occurredAt)),
    listAttachments(userId, id),
  ]);
  return { app, evidence, documents, timeline, attachments };
}
export async function replaceEvidence(
  userId: string,
  applicationId: string,
  careerItemIds: string[],
) {
  const owned = careerItemIds.length
    ? await getDb()
        .select({ id: careerItems.id })
        .from(careerItems)
        .where(and(eq(careerItems.userId, userId), inArray(careerItems.id, careerItemIds)))
    : [];
  if (owned.length !== careerItemIds.length) return false;
  await getDb()
    .delete(applicationEvidence)
    .where(
      and(
        eq(applicationEvidence.applicationId, applicationId),
        eq(applicationEvidence.userId, userId),
      ),
    );
  if (owned.length)
    await getDb()
      .insert(applicationEvidence)
      .values(
        owned.map(({ id }) => ({
          id: crypto.randomUUID(),
          userId,
          applicationId,
          careerItemId: id,
        })),
      );
  return true;
}
export async function addDocumentVersion(
  userId: string,
  applicationId: string,
  input: {
    content: string;
    documentType: ApplicationDocumentType;
    status: ApplicationDocumentStatus;
    sourceNote: string;
  },
) {
  const application = await getDb().query.jobApplications.findFirst({
    where: and(eq(jobApplications.id, applicationId), eq(jobApplications.userId, userId)),
  });
  if (!application) return null;
  const [latest, evidence, analysis] = await Promise.all([
    getDb().query.applicationDocumentVersions.findFirst({
      where: and(
        eq(applicationDocumentVersions.userId, userId),
        eq(applicationDocumentVersions.applicationId, applicationId),
        eq(applicationDocumentVersions.documentType, input.documentType),
      ),
      orderBy: desc(applicationDocumentVersions.version),
    }),
    getDb()
      .select({ careerItemId: applicationEvidence.careerItemId })
      .from(applicationEvidence)
      .where(
        and(
          eq(applicationEvidence.userId, userId),
          eq(applicationEvidence.applicationId, applicationId),
        ),
      ),
    application.opportunityId
      ? getDb().query.opportunityAnalyses.findFirst({
          where: and(
            eq(opportunityAnalyses.userId, userId),
            eq(opportunityAnalyses.opportunityId, application.opportunityId),
            isNotNull(opportunityAnalyses.confirmedAt),
          ),
          orderBy: desc(opportunityAnalyses.version),
        })
      : Promise.resolve(undefined),
  ]);
  const [item] = await getDb()
    .insert(applicationDocumentVersions)
    .values({
      id: crypto.randomUUID(),
      userId,
      applicationId,
      documentType: input.documentType,
      status: input.status,
      version: nextDocumentVersion(latest?.version),
      content: input.content,
      sourceNote: input.sourceNote,
      analysisId: analysis?.id ?? null,
      evidenceSnapshot: JSON.stringify(evidence.map((item) => item.careerItemId)),
    })
    .returning();
  await addTimelineEvent(
    userId,
    applicationId,
    "document",
    now(),
    `Bewerbungstext gespeichert: ${input.documentType} v${item.version} (${input.status}).`,
  );
  return item;
}
