import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CommunityAccount } from "../app/community/CommunityAccount.tsx";

type FetchResult = { status: number; body: Record<string, string> };

function installDom() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://jnsw.de" });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: dom.window.navigator,
  });
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    HTMLFormElement: dom.window.HTMLFormElement,
    HTMLInputElement: dom.window.HTMLInputElement,
    Event: dom.window.Event,
    FormData: dom.window.FormData,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  return dom;
}

function setInput(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

async function renderAccount(result: FetchResult) {
  const container = document.createElement("div");
  document.body.append(container);
  const root: Root = createRoot(container);
  globalThis.fetch = (async () => {
    await Promise.resolve();
    return Response.json(result.body, { status: result.status });
  }) as typeof fetch;
  await act(async () => {
    root.render(createElement(CommunityAccount, { initialUser: null }));
  });
  return { container, root };
}

async function submitRegistration(container: HTMLElement) {
  setInput(container.querySelector('input[name="displayName"]')!, "Jane");
  setInput(container.querySelector('input[name="email"]')!, "jane@example.com");
  setInput(container.querySelector('input[name="password"]')!, "a-secure-password");
  await act(async () => {
    container
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await Promise.resolve();
    await Promise.resolve();
  });
}

test("resets the registration form after a successful asynchronous request", async () => {
  const dom = installDom();
  const errors: unknown[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => errors.push(args);
  try {
    const { container, root } = await renderAccount({
      status: 201,
      body: { message: "Bestätigungs-E-Mail gesendet." },
    });
    const form = container.querySelector("form")!;
    let resetCount = 0;
    const reset = form.reset.bind(form);
    form.reset = () => {
      resetCount++;
      reset();
    };
    await submitRegistration(container);
    assert.equal(resetCount, 1);
    assert.equal(container.querySelector('input[name="email"]'), null);
    assert.match(container.textContent ?? "", /Bestätigungs-E-Mail gesendet/);
    assert.equal(errors.length, 0);
    await act(async () => {
      root.unmount();
    });
  } finally {
    console.error = originalError;
    dom.window.close();
  }
});

for (const [name, result] of [
  ["invalid input", { status: 400, body: { error: "Ungültige Eingaben." } }],
  ["existing email", { status: 409, body: { error: "E-Mail-Adresse bereits registriert." } }],
  [
    "failed verification email",
    { status: 503, body: { error: "Bestätigungs-E-Mail konnte nicht gesendet werden." } },
  ],
] as const) {
  test(`keeps registration data and shows the error for ${name}`, async () => {
    const dom = installDom();
    try {
      const { container, root } = await renderAccount(result);
      await submitRegistration(container);
      assert.equal(container.querySelector('input[name="email"]')?.value, "jane@example.com");
      assert.match(container.textContent ?? "", new RegExp(result.body.error));
      await act(async () => {
        root.unmount();
      });
    } finally {
      dom.window.close();
    }
  });
}
