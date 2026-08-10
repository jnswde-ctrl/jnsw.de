import assert from "node:assert/strict";
import test from "node:test";
import {
  applicationStatusLabels,
  canTransitionApplicationStatus,
  canTransitionOpportunityReviewStatus,
  followUpState,
  nextApplicationAction,
  nextApplicationStatuses,
  isManualTimelineEventType,
  opportunityListingStatusLabels,
  opportunityReviewStatusLabels,
  requiresOpportunityAnalysis,
} from "../db/workflow";

test("uses German labels for every persisted workflow status", () => {
  assert.equal(applicationStatusLabels.waiting, "Rückmeldung offen");
  assert.equal(opportunityReviewStatusLabels.on_hold, "Zurückgestellt");
  assert.equal(opportunityListingStatusLabels.closed, "Geschlossen");
});

test("allows only non-status events to be added manually to an application timeline", () => {
  assert.equal(isManualTimelineEventType("follow_up"), true);
  assert.equal(isManualTimelineEventType("interview"), false);
  assert.equal(isManualTimelineEventType("response"), false);
  assert.equal(isManualTimelineEventType("status_changed"), false);
});

test("prioritizes overdue follow-ups and gives sent applications a concrete next action", () => {
  assert.equal(followUpState("2026-08-09", "2026-08-10"), "overdue");
  assert.equal(followUpState("2026-08-10", "2026-08-10"), "due_today");
  assert.equal(followUpState("2026-08-11", "2026-08-10"), "upcoming");
  assert.equal(
    nextApplicationAction({ status: "waiting", followUpAt: null, deadlineAt: null }, "2026-08-10")
      ?.label,
    "Follow-up festlegen",
  );
});

test("allows only the documented application status transitions", () => {
  assert.equal(canTransitionApplicationStatus("draft", "ready"), true);
  assert.equal(canTransitionApplicationStatus("sent", "waiting"), true);
  assert.equal(canTransitionApplicationStatus("waiting", "offer"), false);
  assert.equal(canTransitionApplicationStatus("rejected", "draft"), false);
  assert.equal(canTransitionApplicationStatus("archived", "archived"), true);
  assert.deepEqual(nextApplicationStatuses("sent"), [
    "sent",
    "waiting",
    "rejected",
    "withdrawn",
    "archived",
  ]);
});

test("allows only the documented opportunity review transitions", () => {
  assert.equal(canTransitionOpportunityReviewStatus("unreviewed", "reviewing"), true);
  assert.equal(canTransitionOpportunityReviewStatus("reviewing", "recommended"), true);
  assert.equal(canTransitionOpportunityReviewStatus("recommended", "reviewing"), true);
  assert.equal(canTransitionOpportunityReviewStatus("unreviewed", "recommended"), false);
  assert.equal(canTransitionOpportunityReviewStatus("not_recommended", "on_hold"), false);
});

test("requires an analysis before a final opportunity decision", () => {
  assert.equal(requiresOpportunityAnalysis("reviewing"), false);
  assert.equal(requiresOpportunityAnalysis("recommended"), true);
  assert.equal(requiresOpportunityAnalysis("on_hold"), true);
  assert.equal(requiresOpportunityAnalysis("not_recommended"), true);
});
