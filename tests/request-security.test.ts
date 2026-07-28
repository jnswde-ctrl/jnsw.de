import assert from "node:assert/strict";
import test from "node:test";
import { isSameOrigin } from "../app/request-security.ts";

test("accepts same-origin and non-browser requests", () => {
  assert.equal(isSameOrigin(new Request("https://jnsw.de/api/account")), true);
  assert.equal(isSameOrigin(new Request("https://jnsw.de/api/account", { headers: { origin: "https://jnsw.de" } })), true);
});

test("rejects a cross-origin browser request", () => {
  assert.equal(isSameOrigin(new Request("https://jnsw.de/api/account", { headers: { origin: "https://attacker.example" } })), false);
});
