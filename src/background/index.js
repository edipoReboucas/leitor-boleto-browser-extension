import { MessageType, onMessage } from '../shared/messaging.js';
import { debug, debugError, debugWarn, getRuntimeError } from '../shared/debug.js';

const CONTENT_SCRIPT_FILE = 'content.js';

debug('background', 'Service worker iniciado');

async function getActiveTabId() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0]?.id;
  debug('background', 'Aba ativa', { tabId, url: tabs[0]?.url });
  return tabId;
}

async function injectContentScript(tabId) {
  debug('background', 'Injetando content script', { tabId, file: CONTENT_SCRIPT_FILE });

  await chrome.scripting.executeScript({
    target: { tabId },
    files: [CONTENT_SCRIPT_FILE],
  });

  const injectError = getRuntimeError();
  if (injectError) {
    throw new Error(injectError);
  }

  debug('background', 'Content script injetado com sucesso', { tabId });
}

async function sendStartMessage(tabId) {
  debug('background', 'Enviando mensagem startBarcodeRead', { tabId });

  const response = await chrome.tabs.sendMessage(tabId, {
    type: MessageType.START_BARCODE_READ,
  });

  const sendError = getRuntimeError();
  if (sendError) {
    throw new Error(sendError);
  }

  debug('background', 'Mensagem startBarcodeRead entregue', { tabId, response });
}

async function notifyStartBarcodeReader() {
  debug('background', 'Ícone da extensão clicado');

  const tabId = await getActiveTabId();

  if (tabId === undefined) {
    debugWarn('background', 'Nenhuma aba ativa encontrada');
    return;
  }

  try {
    await sendStartMessage(tabId);
    debug('background', 'Content script já estava carregado na aba', { tabId });
  } catch (firstError) {
    debugWarn('background', 'Falha ao enviar mensagem (tentando injetar)', {
      tabId,
      error: firstError?.message || String(firstError),
    });

    try {
      await injectContentScript(tabId);
      await sendStartMessage(tabId);
      debug('background', 'Fluxo de injeção + start concluído', { tabId });
    } catch (secondError) {
      debugError('background', 'Falha ao iniciar leitor na aba', {
        tabId,
        error: secondError?.message || String(secondError),
        runtimeError: getRuntimeError(),
      });
    }
  }
}

chrome.action.onClicked.addListener(() => {
  notifyStartBarcodeReader();
});

onMessage(MessageType.READ_BARCODE, (request, sender, sendResponse) => {
  const windowId = sender.tab?.windowId;

  debug('background', 'Mensagem readBarcode recebida', {
    tabId: sender.tab?.id,
    windowId,
    cropBox: request.cropBox,
  });

  if (windowId === undefined) {
    debugWarn('background', 'readBarcode sem windowId — abortando captura');
    sendResponse(null);
    return;
  }

  chrome.tabs
    .captureVisibleTab(windowId, { format: 'png' })
    .then((visibleTabImageDataURL) => {
      debug('background', 'Captura de tela concluída', {
        dataUrlLength: visibleTabImageDataURL?.length ?? 0,
      });
      sendResponse({ visibleTabImageDataURL });
    })
    .catch((error) => {
      debugError('background', 'Falha na captura de tela', error);
      sendResponse(null);
    });

  return true;
});
