// Worker-Integrationstest: erst mit Cloudflare-kompatibler Testlaufzeit aktivieren.
import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname) {
  const url = new URL("../dist/server/index.js", import.meta.url);
  url.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(url.href);
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

for (const [path, title, content] of [["/", "JNSW.DE", "Digital"], ["/tools", "Tools", "Werkzeuge"], ["/informationen", "Informationen", "Wissen,"]]) {
  test(`server-renders ${path}`, async () => {
    const response = await render(path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(`<title>[^<]*${title}`));
    assert.match(html, new RegExp(content));
    assert.match(html, /Hauptnavigation/);
    assert.doesNotMatch(html, /Your site is taking shape|Building your site/i);
  });
}
