import {
  addAnalysis,
  confirmAnalysis,
  opportunityAnalysis,
} from "../../../../../../db/opportunity-analysis";
import {
  analysisRecommendationValues,
  opportunityRequirementKindValues,
  requirementAssessmentValues,
} from "../../../../../../db/schema";
import { scoreScale } from "../../../../../../db/profile-fit";
import { activeUser, denied, json, mutationAllowed, privateHeaders, text } from "../../../support";

type Context = { params: Promise<{ id: string }> };
const stringList = (value: unknown, max = 20) =>
  Array.isArray(value) &&
  value.length <= max &&
  value.every((item) => typeof item === "string" && item.trim() && item.length <= 500)
    ? value.map((item) => item.trim())
    : null;
export async function GET(_: Request, { params }: Context) {
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  return Response.json(await opportunityAnalysis(user.id, (await params).id), {
    headers: privateHeaders,
  });
}
export async function POST(request: Request, { params }: Context) {
  if (!mutationAllowed(request)) return denied(403, "Invalid origin");
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  const body = await json(request);
  const score = body?.score,
    recommendation = body?.recommendation;
  const requirements =
    Array.isArray(body?.requirements) &&
    body.requirements.length > 0 &&
    body.requirements.length <= 30
      ? body.requirements.map((item) =>
          item && typeof item === "object" ? (item as Record<string, unknown>) : null,
        )
      : null;
  const strengths =
      Array.isArray(body?.strengths) && body.strengths.length <= 20
        ? body.strengths.map((item) =>
            item && typeof item === "object" ? (item as Record<string, unknown>) : null,
          )
        : null,
    gaps = stringList(body?.gaps),
    risks = stringList(body?.risks),
    evidenceItemIds = stringList(body?.evidenceItemIds);
  if (
    !Number.isInteger(score) ||
    score < 0 ||
    score > 100 ||
    !analysisRecommendationValues.includes(recommendation as never) ||
    !requirements ||
    !strengths ||
    !gaps ||
    !risks ||
    !evidenceItemIds ||
    !strengths ||
    strengths.some(
      (item) =>
        !item || !text(item.text, 500, true) || !stringList(item.evidenceItemIds, 20)?.length,
    ) ||
    requirements.some(
      (item) =>
        !item ||
        !text(item.text, 500, true) ||
        !opportunityRequirementKindValues.includes(item.kind as never) ||
        !requirementAssessmentValues.includes(item.assessment as never) ||
        !stringList(item.evidenceItemIds, 20) ||
        (["met", "partial"].includes(item.assessment as string) &&
          !stringList(item.evidenceItemIds, 20)?.length),
    )
  )
    return denied(400, "Invalid analysis data");
  const analysis = await addAnalysis(user.id, (await params).id, {
    score,
    recommendation: recommendation as never,
    strengths: strengths.map((item) => ({
      text: text(item!.text, 500, true)!,
      evidenceItemIds: stringList(item!.evidenceItemIds, 20)!,
    })),
    gaps,
    risks,
    evidenceItemIds,
    modelVersion: text(body?.modelVersion, 120, true),
    promptVersion: text(body?.promptVersion, 120, true),
    supersedesAnalysisId: text(body?.supersedesAnalysisId, 120),
    requirements: requirements.map((item) => ({
      text: text(item!.text, 500, true)!,
      kind: item!.kind as never,
      assessment: item!.assessment as never,
      evidenceItemIds: stringList(item!.evidenceItemIds, 20)!,
    })),
  });
  return analysis
    ? Response.json({ analysis, scoreScale }, { status: 201, headers: privateHeaders })
    : denied(422, "Positive claims require owned evidence");
}
export async function PATCH(request: Request, { params }: Context) {
  if (!mutationAllowed(request)) return denied(403, "Invalid origin");
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  const body = await json(request),
    analysisId = text(body?.analysisId, 120, true),
    correctionNote = text(body?.correctionNote, 2000) ?? "";
  if (!analysisId) return denied(400, "Invalid confirmation");
  const analysis = await confirmAnalysis(user.id, (await params).id, analysisId, correctionNote);
  return analysis
    ? Response.json({ analysis }, { headers: privateHeaders })
    : denied(404, "Analysis not found or already confirmed");
}
