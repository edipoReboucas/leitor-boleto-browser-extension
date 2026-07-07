export const MessageType = {
  START_BARCODE_READ: 'startBarcodeRead',
  READ_BARCODE: 'readBarcode',
  OPEN_EXTENSIONS_PAGE: 'openExtensionsPage',
};

export function onMessage(type, callback) {
  const listener = (request, sender, sendResponse) => {
    if (request.type !== type) {
      return;
    }

    return callback(request, sender, sendResponse);
  };

  chrome.runtime.onMessage.addListener(listener);

  return () => {
    chrome.runtime.onMessage.removeListener(listener);
  };
}
