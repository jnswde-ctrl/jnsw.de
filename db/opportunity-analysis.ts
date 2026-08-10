import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from ".";
import {
  careerItems,
  jobOpportunities,
  opportunityAnalyses,
  opportunityAnalysisEvidence,
  opportunityAnalysisConfirmations,
  opportunityRequirements,
  profileSkillEvidence,
  profileSkills,
} from "./schema";

export async function profile(userId: string) {
  const skills = await getDb()
    .select()
    .from(profileSkills)
    .where(eq(profileSkills.userId, userId))
    .orderBy(desc(profileSkills.updatedAt));
  const ids = skills.map((skill) => skill.id);
  const evidence = ids.length
    ? await getDb()
        .select({
          skillId: profileSkillEvidence.skillId,
          careerItemId: profileSkillEvidence.careerItemId,
        })
        .from(profileSkillEvidence)
        .where(
          and(eq(profileSkillEvidence.userId, userId), inArray(profileSkillEvidence.skillId, ids)),
        )
    : [];
  return { skills, evidence };
}

export async function addProfileSkill(
  userId: string,
  input: {
    name: string;
    kind: "experience" | "learning";
    level: "basic" | "working" | "advanced" | "expert";
    careerItemIds: string[];
  },
) {
  if (input.kind === "experience" && input.careerItemIds.length === 0) return null;
  const owned = input.careerItemIds.length
    ? await getDb()
        .select({ id: careerItems.id })
        .from(careerItems)
        .where(and(eq(careerItems.userId, userId), inArray(careerItems.id, input.careerItemIds)))
    : [];
  if (owned.length !== input.careerItemIds.length) return null;
  const id = crypto.randomUUID();
  const [skill] = await getDb()
    .insert(profileSkills)
    .values({ id, userId, ...input })
    .returning();
  if (owned.length)
    await getDb()
      .insert(profileSkillEvidence)
      .values(
        owned.map(({ id: careerItemId }) => ({
          id: crypto.randomUUID(),
          userId,
          skillId: id,
          careerItemId,
        })),
      );
  return skill;
}

export async function opportunityAnalysis(userId: string, opportunityId: string) {
  const [analyses] = await Promise.all([
    getDb()
      .select()
      .from(opportunityAnalyses)
      .where(
        and(
          eq(opportunityAnalyses.userId, userId),
          eq(opportunityAnalyses.opportunityId, opportunityId),
        ),
      )
      .orderBy(desc(opportunityAnalyses.version)),
  ]);
  const ids = analyses.map((analysis) => analysis.id);
  const requirements = ids.length
    ? await getDb()
        .select()
        .from(opportunityRequirements)
        .where(
          and(
            eq(opportunityRequirements.userId, userId),
            inArray(opportunityRequirements.analysisId, ids),
          ),
        )
    : [];
  const evidence = ids.length
    ? await getDb()
        .select()
        .from(opportunityAnalysisEvidence)
        .where(
          and(
            eq(opportunityAnalysisEvidence.userId, userId),
            inArray(opportunityAnalysisEvidence.analysisId, ids),
          ),
        )
    : [];
  return { requirements, analyses, evidence };
}

export async function addAnalysis(
  userId: string,
  opportunityId: string,
  input: {
    requirements: Array<{
      text: string;
      kind: "must" | "nice_to_have";
      assessment: "met" | "partial" | "not_met" | "unknown";
      evidenceItemIds: string[];
    }>;
    score: number;
    recommendation: "recommended" | "on_hold" | "not_recommended";
    strengths: Array<{ text: string; evidenceItemIds: string[] }>;
    gaps: string[];
    risks: string[];
    evidenceItemIds: string[];
    modelVersion: string | null;
    promptVersion: string | null;
    supersedesAnalysisId: string | null;
  },
) {
  const opportunity = await getDb().query.jobOpportunities.findFirst({
    where: and(eq(jobOpportunities.id, opportunityId), eq(jobOpportunities.userId, userId)),
  });
  if (!opportunity) return null;
  const claimEvidenceIds = [
    ...input.evidenceItemIds,
    ...input.strengths.flatMap((strength) => strength.evidenceItemIds),
    ...input.requirements.flatMap((requirement) => requirement.evidenceItemIds),
  ];
  if (
    input.strengths.some((strength) => !strength.evidenceItemIds.length) ||
    input.requirements.some(
      (requirement) =>
        ["met", "partial"].includes(requirement.assessment) && !requirement.evidenceItemIds.length,
    )
  )
    return null;
  const uniqueEvidenceIds = [...new Set(claimEvidenceIds)];
  const owned = uniqueEvidenceIds.length
    ? await getDb()
        .select({ id: careerItems.id })
        .from(careerItems)
        .where(and(eq(careerItems.userId, userId), inArray(careerItems.id, uniqueEvidenceIds)))
    : [];
  if (owned.length !== uniqueEvidenceIds.length) return null;
  if (input.supersedesAnalysisId) {
    const original = await getDb().query.opportunityAnalyses.findFirst({
      where: and(
        eq(opportunityAnalyses.id, input.supersedesAnalysisId),
        eq(opportunityAnalyses.userId, userId),
        eq(opportunityAnalyses.opportunityId, opportunityId),
      ),
    });
    if (!original) return null;
  }
  const latest = await getDb().query.opportunityAnalyses.findFirst({
    where: and(
      eq(opportunityAnalyses.userId, userId),
      eq(opportunityAnalyses.opportunityId, opportunityId),
    ),
    orderBy: desc(opportunityAnalyses.version),
  });
  const version = String((Number(latest?.version ?? "0") || 0) + 1);
  const analysisId = crypto.randomUUID();
  await getDb().batch([
    getDb()
      .insert(opportunityAnalyses)
      .values({
        id: analysisId,
        userId,
        opportunityId,
        version,
        score: String(input.score),
        recommendation: input.recommendation,
        strengths: JSON.stringify(input.strengths),
        gaps: JSON.stringify(input.gaps),
        risks: JSON.stringify(input.risks),
        modelVersion: input.modelVersion,
        promptVersion: input.promptVersion,
      }),
    ...input.requirements.map((requirement) =>
      getDb()
        .insert(opportunityRequirements)
        .values({
          id: crypto.randomUUID(),
          userId,
          opportunityId,
          analysisId,
          ...requirement,
          evidenceItemIds: JSON.stringify(requirement.evidenceItemIds),
        }),
    ),
    ...owned.map(({ id: careerItemId }) =>
      getDb()
        .insert(opportunityAnalysisEvidence)
        .values({ id: crypto.randomUUID(), userId, analysisId, careerItemId }),
    ),
  ]);
  return getDb().query.opportunityAnalyses.findFirst({
    where: eq(opportunityAnalyses.id, analysisId),
  });
}

export async function confirmAnalysis(
  userId: string,
  opportunityId: string,
  analysisId: string,
  correctionNote: string,
) {
  const analysis = await getDb().query.opportunityAnalyses.findFirst({
    where: and(
      eq(opportunityAnalyses.id, analysisId),
      eq(opportunityAnalyses.opportunityId, opportunityId),
      eq(opportunityAnalyses.userId, userId),
    ),
  });
  if (!analysis) return null;
  try {
    const [confirmation] = await getDb()
      .insert(opportunityAnalysisConfirmations)
      .values({ id: crypto.randomUUID(), userId, analysisId, correctionNote })
      .returning();
    return confirmation;
  } catch {
    return null;
  }
}
