import assert from "node:assert/strict";
import test from "node:test";
import { isSameOrigin } from "../app/request-security.ts";

test("accepts a same-origin browser request", () => {
  assert.equal(
    isSameOrigin(
      new Request("https://jnsw.de/api/account", { headers: { origin: "https://jnsw.de" } }),
    ),
    true,
  );
});

test("rejects a request without Origin", () => {
  assert.equal(isSameOrigin(new Request("https://jnsw.de/api/account")), false);
});

test("rejects a cross-origin browser request", () => {
  assert.equal(
    isSameOrigin(
      new Request("https://jnsw.de/api/account", {
        headers: { origin: "https://attacker.example" },
      }),
    ),
    false,
  );
});
