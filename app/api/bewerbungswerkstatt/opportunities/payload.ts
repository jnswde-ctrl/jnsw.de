import {
  opportunityListingStatusValues,
  opportunityRemoteModelValues,
  opportunitySourceTypeValues,
} from "../../../../db/schema";
import { date, text } from "../input";

export function createOpportunityPayload(body: Record<string, unknown> | null) {
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
    return null;
  return {
    sourceKey,
    sourceType: sourceType as (typeof opportunitySourceTypeValues)[number],
    company,
    role,
    jobUrl: jobUrl || null,
    location: text(body?.location, 160),
    remoteModel: remoteModel as (typeof opportunityRemoteModelValues)[number],
    advertisedSalary: text(body?.advertisedSalary, 120),
    deadlineAt,
    applicationMethod: text(body?.applicationMethod, 160),
    sourceCheckedAt,
    listingStatus: listingStatus as (typeof opportunityListingStatusValues)[number],
    reviewStatus: "unreviewed" as const,
    notes: text(body?.notes, 8000) ?? "",
  };
}

function timestamp(value: unknown) {
  if (value === null || value === "" || value === undefined) return null;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return undefined;
  return new Date(value).toISOString();
}
