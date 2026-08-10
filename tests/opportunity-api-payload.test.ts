import assert from "node:assert/strict";
import test from "node:test";
import { createOpportunityPayload } from "../app/api/bewerbungswerkstatt/opportunities/payload";

const validRequest = {
  sourceKey: "url:example",
  sourceType: "url",
  company: "Example GmbH",
  role: "Developer",
  jobUrl: "https://example.test/jobs/1",
  sourceCheckedAt: "2026-08-10T10:00:00.000Z",
};

test("accepts a valid opportunity create API payload", () => {
  assert.deepEqual(createOpportunityPayload(validRequest), {
    ...validRequest,
    jobUrl: validRequest.jobUrl,
    location: null,
    remoteModel: "unknown",
    advertisedSalary: null,
    deadlineAt: null,
    applicationMethod: null,
    listingStatus: "unknown",
    reviewStatus: "unreviewed",
    notes: "",
  });
});

test("rejects invalid opportunity create API payloads", () => {
  assert.equal(createOpportunityPayload({ ...validRequest, sourceType: "feed" }), null);
  assert.equal(createOpportunityPayload({ ...validRequest, jobUrl: "not a URL" }), null);
  assert.equal(createOpportunityPayload({ ...validRequest, sourceCheckedAt: "invalid" }), null);
  assert.equal(createOpportunityPayload({ ...validRequest, reviewStatus: "recommended" }), null);
  assert.equal(createOpportunityPayload({ ...validRequest, company: "" }), null);
});
