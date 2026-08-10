import {
  convertOpportunityToApplication,
  deleteOpportunity,
  opportunityDetail,
  updateOpportunity,
} from "../../../../../db/opportunities";
import {
  opportunityListingStatusValues,
  opportunityRemoteModelValues,
  opportunityReviewStatusValues,
} from "../../../../../db/schema";
import {
  activeUser,
  date,
  denied,
  json,
  mutationAllowed,
  privateHeaders,
  text,
} from "../../support";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Context) {
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  const detail = await opportunityDetail(user.id, (await params).id);
  return detail ? Response.json(detail, { headers: privateHeaders }) : denied(404, "Not found");
}

export async function PATCH(request: Request, { params }: Context) {
  if (!mutationAllowed(request)) return denied(403, "Invalid origin");
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  const id = (await params).id;
  const body = await json(request);
  if (body?.action === "convert") {
    const result = await convertOpportunityToApplication(user.id, id);
    if (result.kind === "not_found") return denied(404, "Not found");
    if (result.kind === "analysis_required")
      return denied(409, "Analyse und Empfehlung müssen vor der Überführung bestätigt sein");
    if (result.kind === "already_converted")
      return Response.json(
        { application: result.application, alreadyConverted: true },
        { headers: privateHeaders },
      );
    return Response.json({ application: result.value }, { status: 201, headers: privateHeaders });
  }
  const deadlineAt = body?.deadlineAt === undefined ? undefined : date(body.deadlineAt);
  const sourceCheckedAt =
    body?.sourceCheckedAt === undefined ? undefined : timestamp(body.sourceCheckedAt);
  const jobUrl = text(body?.jobUrl, 2048);
  const remoteModel = body?.remoteModel;
  const listingStatus = body?.listingStatus;
  const reviewStatus = body?.reviewStatus;
  if (
    (body?.deadlineAt !== undefined && deadlineAt === undefined) ||
    (body?.sourceCheckedAt !== undefined && sourceCheckedAt === undefined) ||
    (jobUrl && !URL.canParse(jobUrl)) ||
    (remoteModel !== undefined && !opportunityRemoteModelValues.includes(remoteModel as never)) ||
    (listingStatus !== undefined &&
      !opportunityListingStatusValues.includes(listingStatus as never)) ||
    (reviewStatus !== undefined && !opportunityReviewStatusValues.includes(reviewStatus as never))
  )
    return denied(400, "Invalid opportunity data");
  const result = await updateOpportunity(user.id, id, {
    company: text(body?.company, 160, true) ?? undefined,
    role: text(body?.role, 160, true) ?? undefined,
    jobUrl: jobUrl ?? undefined,
    location: text(body?.location, 160) ?? undefined,
    remoteModel: remoteModel as never,
    advertisedSalary: text(body?.advertisedSalary, 120) ?? undefined,
    deadlineAt,
    applicationMethod: text(body?.applicationMethod, 160) ?? undefined,
    sourceCheckedAt,
    listingStatus: listingStatus as never,
    reviewStatus: reviewStatus as never,
    notes: text(body?.notes, 8000) ?? undefined,
    archivedAt: body?.action === "archive" ? new Date().toISOString() : undefined,
  });
  if (result.kind === "invalid_transition") return denied(400, "Invalid review status transition");
  if (result.kind === "analysis_required")
    return denied(409, "Eine Analyse ist vor dieser Entscheidung erforderlich");
  return result.kind === "ok"
    ? Response.json({ opportunity: result.value }, { headers: privateHeaders })
    : denied(404, "Not found");
}

export async function DELETE(request: Request, { params }: Context) {
  if (!mutationAllowed(request)) return denied(403, "Invalid origin");
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  return (await deleteOpportunity(user.id, (await params).id))
    ? new Response(null, { status: 204, headers: privateHeaders })
    : denied(404, "Not found");
}

function timestamp(value: unknown) {
  if (value === null || value === "" || value === undefined) return null;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return undefined;
  return new Date(value).toISOString();
}
