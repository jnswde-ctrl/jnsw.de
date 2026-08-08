import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { AdminUsers } from "../app/admin/AdminUsers.tsx";

test("loads users and persists access changes from the admin interface", async () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://jnsw.de" });
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    Event: dom.window.Event,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const requests: RequestInit[] = [];
  globalThis.fetch = (async (_input, init) => {
    requests.push(init ?? {});
    if (init?.method === "PATCH")
      return Response.json({
        user: {
          id: "1",
          displayName: "Jane",
          role: "admin",
          status: "active",
          createdAt: "2026-01-01",
          lastSignedInAt: null,
        },
      });
    return Response.json({
      users: [
        {
          id: "1",
          displayName: "Jane",
          role: "member",
          status: "active",
          createdAt: "2026-01-01",
          lastSignedInAt: null,
        },
      ],
      total: 1,
    });
  }) as typeof fetch;
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(createElement(AdminUsers));
    await Promise.resolve();
    await Promise.resolve();
  });
  assert.match(container.textContent ?? "", /1 Konten/);
  const selects = container.querySelectorAll("select");
  (selects[0] as HTMLSelectElement).value = "admin";
  await act(async () => {
    selects[0].dispatchEvent(new Event("change", { bubbles: true }));
    container
      .querySelector(".community-button")
      ?.dispatchEvent(new Event("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
  });
  assert.equal(requests.at(-1)?.method, "PATCH");
  assert.match(String(requests.at(-1)?.body), /"role":"admin"/);
  await act(async () => root.unmount());
  dom.window.close();
});
