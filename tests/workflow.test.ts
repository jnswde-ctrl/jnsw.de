import assert from "node:assert/strict";
import test from "node:test";
import {
  applicationStatusLabels,
  canTransitionApplicationStatus,
  canTransitionOpportunityReviewStatus,
  opportunityListingStatusLabels,
  opportunityReviewStatusLabels,
} from "../db/workflow";

test("uses German labels for every persisted workflow status", () => {
  assert.equal(applicationStatusLabels.waiting, "Rückmeldung offen");
  assert.equal(opportunityReviewStatusLabels.on_hold, "Zurückgestellt");
  assert.equal(opportunityListingStatusLabels.closed, "Geschlossen");
});

test("allows only the documented application status transitions", () => {
  assert.equal(canTransitionApplicationStatus("draft", "ready"), true);
  assert.equal(canTransitionApplicationStatus("sent", "waiting"), true);
  assert.equal(canTransitionApplicationStatus("waiting", "offer"), false);
  assert.equal(canTransitionApplicationStatus("rejected", "draft"), false);
  assert.equal(canTransitionApplicationStatus("archived", "archived"), true);
});

test("allows only the documented opportunity review transitions", () => {
  assert.equal(canTransitionOpportunityReviewStatus("unreviewed", "reviewing"), true);
  assert.equal(canTransitionOpportunityReviewStatus("reviewing", "recommended"), true);
  assert.equal(canTransitionOpportunityReviewStatus("recommended", "reviewing"), true);
  assert.equal(canTransitionOpportunityReviewStatus("unreviewed", "recommended"), false);
  assert.equal(canTransitionOpportunityReviewStatus("not_recommended", "on_hold"), false);
});
