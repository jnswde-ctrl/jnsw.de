import { createOpportunity, listOpportunities } from "../../../../db/opportunities";
import {
  opportunityListingStatusValues,
  opportunityRemoteModelValues,
  opportunitySourceTypeValues,
} from "../../../../db/schema";
import { activeUser, date, denied, json, mutationAllowed, privateHeaders, text } from "../support";

export async function GET() {
  const user = await activeUser();
  return user
    ? Response.json(
        { opportunities: await listOpportunities(user.id) },
        { headers: privateHeaders },
      )
    : denied(401, "Authentication required");
}

export async function POST(request: Request) {
  if (!mutationAllowed(request)) return denied(403, "Invalid origin");
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  const body = await json(request);
  const sourceKey = text(body?.sourceKey, 320, true);
  const company = text(body?.company, 160, true);
  const role = text(body?.role, 160, true);
  const jobUrl = text(body?.jobUrl, 2048);
  const deadlineAt = date(body?.deadlineAt);
  const sourceCheckedAt = timestamp(body?.sourceCheckedAt);
  const sourceType = body?.sourceType;
  const remoteModel = body?.remoteModel ?? "unknown";
  const listingStatus = body?.listingStatus ?? "unknown";
  const reviewStatus = body?.reviewStatus ?? "unreviewed";
  if (
    !sourceKey ||
    !company ||
    !role ||
    !opportunitySourceTypeValues.includes(sourceType as never) ||
    !opportunityRemoteModelValues.includes(remoteModel as never) ||
    !opportunityListingStatusValues.includes(listingStatus as never) ||
    reviewStatus !== "unreviewed" ||
    deadlineAt === undefined ||
    sourceCheckedAt === undefined ||
    (jobUrl && !URL.canParse(jobUrl))
  )
    return denied(400, "Invalid opportunity data");
  try {
    const opportunity = await createOpportunity(user.id, {
      sourceKey,
      sourceType: sourceType as never,
      company,
      role,
      jobUrl: jobUrl || null,
      location: text(body?.location, 160),
      remoteModel: remoteModel as never,
      advertisedSalary: text(body?.advertisedSalary, 120),
      deadlineAt,
      applicationMethod: text(body?.applicationMethod, 160),
      sourceCheckedAt,
      listingStatus: listingStatus as never,
      reviewStatus: reviewStatus as never,
      notes: text(body?.notes, 8000) ?? "",
    });
    return Response.json({ opportunity }, { status: 201, headers: privateHeaders });
  } catch {
    return denied(409, "Opportunity source key already exists");
  }
}

function timestamp(value: unknown) {
  if (value === null || value === "" || value === undefined) return null;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return undefined;
  return new Date(value).toISOString();
}
