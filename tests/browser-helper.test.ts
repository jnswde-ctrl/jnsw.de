import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { createPageCaptureXml, FORMAT_VERSION } from "../browser-helper/xml.js";

function assertValidXml(xml: string) {
  const window = new JSDOM().window;
  const document = new window.DOMParser().parseFromString(xml, "application/xml");
  assert.equal(document.querySelector("parsererror"), null);
}

test("creates valid, readable XML for a page capture", () => {
  const xml = createPageCaptureXml({
    url: "https://jobs.example.test/search?a=1&b=2",
    title: "Entwicklerin <Vollzeit>",
    bodyHtml: '<body><p>"Stelle" & mehr</p></body>',
    capturedAt: "2026-08-17T10:00:00.000Z",
  });

  assert.match(xml, new RegExp(`<jnsw-page-capture version="${FORMAT_VERSION}">`));
  assert.match(xml, /<url>https:\/\/jobs\.example\.test\/search\?a=1&amp;b=2<\/url>/);
  assert.match(xml, /<title>Entwicklerin &lt;Vollzeit&gt;<\/title>/);
  assert.match(xml, /<!\[CDATA\[<body><p>"Stelle" & mehr<\/p><\/body>\]\]>/);
  assertValidXml(xml);
});

test("keeps XML valid when page HTML contains a CDATA closing marker", () => {
  const xml = createPageCaptureXml({
    url: "https://jobs.example.test",
    title: "Test",
    bodyHtml: "<body>before ]]> after</body>",
    capturedAt: "2026-08-17T10:00:00.000Z",
  });

  assert.match(xml, /\]\]\]><!\[CDATA\[>/);
  assert.doesNotMatch(xml, /\u001f/);
  assertValidXml(xml);
});
