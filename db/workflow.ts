import type { ApplicationStatus } from "./applications";
import type { OpportunityReviewStatus } from "./opportunities";

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
