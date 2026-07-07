var eventsContentModuleAlreadyLoaded;

if (!eventsContentModuleAlreadyLoaded) {
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

  var onStartBarcodeReader = onMessageListener('startBarcodeRead');

  var onCancelBarcodeReader = (callback) => {
    window.addEventListener('keyup', (event) => {
      if (event.keyCode === 27) {
        return callback(event);
      }
    });
  };
}

eventsContentModuleAlreadyLoaded = true;
