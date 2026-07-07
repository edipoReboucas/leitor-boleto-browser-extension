importScripts('../modules/events-background.js');

onAction(notifyStartBarcodeReader);

onCaptureVisibleTab((request, sender, sendResponse) => {
  const windowId = sender.tab && sender.tab.windowId;

  if (windowId === undefined) {
    sendResponse(null);
    return;
  }

  chrome.tabs.captureVisibleTab(windowId, { format: 'png' })
    .then(visibleTabImageDataURL => sendResponse({ visibleTabImageDataURL }))
    .catch(() => sendResponse(null));

  return true;
});
