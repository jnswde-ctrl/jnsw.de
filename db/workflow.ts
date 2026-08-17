import type { ApplicationStatus } from "./applications";
import type { OpportunityListingStatus, OpportunityReviewStatus } from "./opportunities";

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  draft: "Entwurf",
  ready: "Bereit",
  sent: "Versendet",
  waiting: "Rückmeldung offen",
  interview: "Interview",
  offer: "Angebot",
  rejected: "Abgesagt",
  withdrawn: "Zurückgezogen",
  archived: "Archiviert",
};

export const opportunityReviewStatusLabels: Record<OpportunityReviewStatus, string> = {
  unreviewed: "Noch nicht geprüft",
  reviewing: "In Prüfung",
  recommended: "Empfohlen",
  on_hold: "Zurückgestellt",
  not_recommended: "Nicht empfohlen",
};

export const opportunityListingStatusLabels: Record<OpportunityListingStatus, string> = {
  unknown: "Unbekannt",
  open: "Offen",
  closed: "Geschlossen",
};

export function requiresOpportunityAnalysis(status: OpportunityReviewStatus) {
  return status === "recommended" || status === "on_hold" || status === "not_recommended";
}

const applicationTransitions: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  draft: ["ready", "withdrawn", "archived"],
  ready: ["sent", "withdrawn", "archived"],
  sent: ["waiting", "rejected", "withdrawn", "archived"],
  waiting: ["interview", "rejected", "withdrawn", "archived"],
  interview: ["offer", "rejected", "withdrawn", "archived"],
  offer: ["rejected", "withdrawn", "archived"],
  rejected: ["archived"],
  withdrawn: ["archived"],
  archived: [],
};

const opportunityReviewTransitions: Record<
  OpportunityReviewStatus,
  readonly OpportunityReviewStatus[]
> = {
  unreviewed: ["reviewing"],
  reviewing: ["recommended", "on_hold", "not_recommended"],
  recommended: ["reviewing", "on_hold", "not_recommended"],
  on_hold: ["reviewing", "recommended", "not_recommended"],
  not_recommended: ["reviewing"],
};

export function canTransitionApplicationStatus(from: ApplicationStatus, to: ApplicationStatus) {
  return from === to || applicationTransitions[from].includes(to);
}

export function nextApplicationStatuses(status: ApplicationStatus) {
  return [status, ...applicationTransitions[status]];
}

export type FollowUpState = "overdue" | "due_today" | "upcoming";
const manualTimelineEventTypes = ["follow_up", "note"] as const;

export function isManualTimelineEventType(value: unknown) {
  return typeof value === "string" && manualTimelineEventTypes.includes(value as never);
}

export function followUpState(
  followUpAt: string | null,
  today = new Date().toISOString().slice(0, 10),
): FollowUpState | null {
  if (!followUpAt) return null;
  if (followUpAt < today) return "overdue";
  if (followUpAt === today) return "due_today";
  return "upcoming";
}

export function nextApplicationAction(
  application: Pick<ApplicationStatusSource, "status" | "followUpAt" | "deadlineAt">,
  today = new Date().toISOString().slice(0, 10),
) {
  const followUp = followUpState(application.followUpAt, today);
  if (followUp)
    return {
      priority: followUp === "overdue" ? 0 : followUp === "due_today" ? 1 : 2,
      date: application.followUpAt!,
      label:
        followUp === "overdue"
          ? "Follow-up überfällig"
          : followUp === "due_today"
            ? "Follow-up heute"
            : "Follow-up geplant",
    };
  if (application.deadlineAt && application.deadlineAt >= today)
    return { priority: 3, date: application.deadlineAt, label: "Bewerbungsfrist" };
  if (application.status === "ready")
    return { priority: 4, date: null, label: "Bewerbung versenden" };
  if (application.status === "sent" || application.status === "waiting")
    return { priority: 5, date: null, label: "Follow-up festlegen" };
  return null;
}

type ApplicationStatusSource = {
  status: ApplicationStatus;
  followUpAt: string | null;
  deadlineAt: string | null;
};

export function canTransitionOpportunityReviewStatus(
  from: OpportunityReviewStatus,
  to: OpportunityReviewStatus,
) {
  return from === to || opportunityReviewTransitions[from].includes(to);
}
