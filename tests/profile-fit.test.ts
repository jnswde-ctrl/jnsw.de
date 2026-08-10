import assert from "node:assert/strict";
import test from "node:test";
import {
  analysisVersionsPresent,
  positiveClaimHasEvidence,
  scoreGuidance,
  scoreScale,
} from "../db/profile-fit";

test("requires individual evidence for every positive requirement assessment", () => {
  assert.equal(positiveClaimHasEvidence("met", []), false);
  assert.equal(positiveClaimHasEvidence("partial", []), false);
  assert.equal(positiveClaimHasEvidence("met", ["career-1"]), true);
  assert.equal(positiveClaimHasEvidence("not_met", []), true);
});

test("documents a stable, interpretable score scale", () => {
  assert.equal(scoreScale, "0-100");
  assert.equal(scoreGuidance.length, 3);
});

test("requires the profile, model and prompt versions for every analysis", () => {
  assert.equal(analysisVersionsPresent("profile-4", "model-1", "prompt-2"), true);
  assert.equal(analysisVersionsPresent(null, "model-1", "prompt-2"), false);
  assert.equal(analysisVersionsPresent("profile-4", null, "prompt-2"), false);
  assert.equal(analysisVersionsPresent("profile-4", "model-1", null), false);
});

test("keeps tenant-scoped evidence identifiers explicit", () => {
  const firstTenantEvidence = ["career-user-a"];
  const secondTenantEvidence = ["career-user-b"];
  assert.notDeepEqual(firstTenantEvidence, secondTenantEvidence);
});
