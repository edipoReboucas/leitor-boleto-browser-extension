var eventsModuleAlreadyLoaded;

if (!eventsModuleAlreadyLoaded) {
  var onMessageListener = topic => callback => {
    const listener = function(request, sender, sendResponse) {
      if (request.type != topic) {
        return;
      }

      return callback(request, sender, sendResponse);
    };

    const unsubscriber = () => {
      chrome.runtime.onMessage.removeListener(listener);
    };

    chrome.runtime.onMessage.addListener(listener);

    return unsubscriber;
  };

  var onAction = callback => {
    chrome.action.onClicked.addListener(callback);

    const unsubscriber = () => {
      chrome.action.onClicked.removeListener(callback);
    };

    return unsubscriber;
  };

  var onCaptureVisibleTab = onMessageListener('readBarcode');

  var notifyStartBarcodeReader = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const tabId = tabs[0].id;

      chrome.scripting.executeScript({
        target: { tabId },
        files: [
          'libs/javascript-barcode-reader.min.js',
          'modules/events-content.js',
          'modules/barcode.js',
          'modules/barcode-reader-ui-componet.js',
          'scripts/content.js'
        ]
      }, () => {
        if (chrome.runtime.lastError) {
          return;
        }

        chrome.tabs.sendMessage(tabId, { type: 'startBarcodeRead' });
      });
    });
  };
}

eventsModuleAlreadyLoaded = true;
