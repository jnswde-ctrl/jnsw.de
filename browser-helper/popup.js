/* global chrome */
import { createPageCaptureXml } from "./xml.js";

const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");
const status = document.querySelector("#status");

function setStatus(message, state = "success") {
  status.textContent = message;
  status.dataset.state = state;
}

function setBusy(isBusy) {
  copyButton.disabled = isBusy;
  downloadButton.disabled = isBusy;
}

async function captureActivePage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id || !tab.url) {
    throw new Error("Es konnte keine geöffnete Seite ermittelt werden.");
  }

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({ title: document.title, bodyHtml: document.body?.outerHTML ?? "" }),
  });

  if (!result?.bodyHtml) {
    throw new Error("Diese Seite enthält keinen erfassbaren Body.");
  }

  return createPageCaptureXml({
    url: tab.url,
    title: result.title,
    bodyHtml: result.bodyHtml,
  });
}

async function withCapture(action) {
  setBusy(true);
  setStatus("Seite wird erfasst …");

  try {
    const xml = await captureActivePage();
    await action(xml);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Die Seite konnte nicht erfasst werden.";
    setStatus(`${message} Browser-interne Seiten können nicht erfasst werden.`, "error");
  } finally {
    setBusy(false);
  }
}

copyButton.addEventListener("click", () =>
  withCapture(async (xml) => {
    await navigator.clipboard.writeText(xml);
    setStatus("XML wurde in die Zwischenablage kopiert.");
  }),
);

downloadButton.addEventListener("click", () =>
  withCapture(async (xml) => {
    const url = URL.createObjectURL(new Blob([xml], { type: "text/plain;charset=utf-8" }));
    await chrome.downloads.download({ url, filename: "jnsw-page-capture.xml.txt", saveAs: true });
    URL.revokeObjectURL(url);
    setStatus("TXT-Download wurde gestartet.");
  }),
);
