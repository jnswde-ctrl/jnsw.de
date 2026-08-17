export const FORMAT_VERSION = "1";

function removeInvalidXmlCharacters(value) {
  return String(value).replaceAll(
    /[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu,
    "",
  );
}

function escapeXmlText(value) {
  return removeInvalidXmlCharacters(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function cdata(value) {
  return `<![CDATA[${removeInvalidXmlCharacters(value).replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

/**
 * Creates the local, versioned exchange format used by the browser helper.
 * The body is placed in CDATA because it intentionally contains page HTML.
 */
export function createPageCaptureXml({
  url,
  title,
  bodyHtml,
  capturedAt = new Date().toISOString(),
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<jnsw-page-capture version="${FORMAT_VERSION}">
  <captured-at>${escapeXmlText(capturedAt)}</captured-at>
  <url>${escapeXmlText(url)}</url>
  <title>${escapeXmlText(title)}</title>
  <body-html>${cdata(bodyHtml)}</body-html>
</jnsw-page-capture>`;
}
