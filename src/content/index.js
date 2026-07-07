import { MessageType, onMessage } from '../shared/messaging.js';
import { BarcodeReaderOverlay } from './overlay.js';
import { debug } from '../shared/debug.js';

const LOADED_FLAG = '__leitorBoletoLoaded';

if (!window[LOADED_FLAG]) {
  window[LOADED_FLAG] = true;
  debug('content', 'Content script carregado', { url: window.location.href });

  const barcodeReader = new BarcodeReaderOverlay();

  onMessage(MessageType.START_BARCODE_READ, () => {
    debug('content', 'Mensagem startBarcodeRead recebida', {
      overlayAtivo: barcodeReader.isStarted(),
    });
    barcodeReader.toggle();
  });

  window.addEventListener('keyup', (event) => {
    if (event.key === 'Escape' && barcodeReader.isStarted()) {
      debug('content', 'ESC pressionado — cancelando overlay');
      barcodeReader.destroy();
    }
  });

  debug('content', 'Listeners registrados');
} else {
  debug('content', 'Content script já estava inicializado — ignorando re-inicialização');
}
