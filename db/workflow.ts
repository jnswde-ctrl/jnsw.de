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

export function canTransitionOpportunityReviewStatus(
  from: OpportunityReviewStatus,
  to: OpportunityReviewStatus,
) {
  return from === to || opportunityReviewTransitions[from].includes(to);
}
