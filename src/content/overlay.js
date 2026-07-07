import { readBarcodeFromCropBox } from './barcode-scanner.js';
import { showBoletoResult } from './boleto-formatter.js';
import { showErrorDialog } from './result-dialog.js';
import { debug, debugError } from '../shared/debug.js';
import themeCss from '../shared/theme.css';
import overlayCss from './overlay.css';

const ROOT_ID = 'lb-overlay-root';
const STYLES_ID = 'lb-overlay-styles';

const MIN_SELECTION_WIDTH = 20;
const MIN_SELECTION_HEIGHT = 10;

const HINTS = {
  idle: 'Arraste para selecionar o código de barras',
  dragging: 'Solte para ler o código',
  reading: 'Lendo código de barras...',
};

const OVERLAY_TIP =
  'Dica: aumente o zoom da página para melhor leitura';

const READ_FAIL_MESSAGE =
  'Aumente o zoom da página (Ctrl + ou ⌘ +), clique no ícone da extensão e selecione o código novamente.';

function normalizeRect(x1, y1, x2, y2) {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

function injectStyles() {
  if (document.getElementById(STYLES_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLES_ID;
  style.textContent = themeCss + overlayCss;
  document.head.appendChild(style);
}

export class BarcodeReaderOverlay {
  constructor() {
    this.started = false;
    this.state = 'idle';
    this.dragging = false;
    this.startX = 0;
    this.startY = 0;
  }

  start() {
    debug('overlay', 'Iniciando overlay de seleção');
    injectStyles();

    this.root = document.createElement('div');
    this.root.id = ROOT_ID;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-label', 'Seleção de código de barras');

    this.scrim = document.createElement('div');
    this.scrim.className = 'lb-overlay-scrim';

    this.toolbar = document.createElement('div');
    this.toolbar.className = 'lb-overlay-toolbar';

    this.textBlock = document.createElement('div');
    this.textBlock.className = 'lb-overlay-text';

    this.hint = document.createElement('p');
    this.hint.className = 'lb-overlay-hint';

    this.tip = document.createElement('p');
    this.tip.className = 'lb-overlay-tip';
    this.tip.textContent = OVERLAY_TIP;

    this.cancelButton = document.createElement('button');
    this.cancelButton.className = 'lb-overlay-cancel';
    this.cancelButton.type = 'button';
    this.cancelButton.textContent = 'Cancelar';

    this.selection = document.createElement('div');
    this.selection.className = 'lb-overlay-selection';

    this.loading = document.createElement('div');
    this.loading.className = 'lb-overlay-loading';

    this.textBlock.appendChild(this.hint);
    this.textBlock.appendChild(this.tip);
    this.toolbar.appendChild(this.textBlock);
    this.toolbar.appendChild(this.cancelButton);
    this.selection.appendChild(this.loading);
    this.root.appendChild(this.scrim);
    this.root.appendChild(this.toolbar);
    this.root.appendChild(this.selection);
    document.body.appendChild(this.root);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onSuccess = this.onSuccess.bind(this);
    this.onFail = this.onFail.bind(this);

    this.scrim.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    this.cancelButton.addEventListener('click', this.onCancel);

    this.setState('idle');
    this.started = true;
  }

  setState(state) {
    this.state = state;
    this.hint.textContent = HINTS[state];
    this.tip.classList.toggle('lb-overlay-tip--visible', state === 'idle');
  }

  updateSelection(rect) {
    this.selection.style.left = `${rect.x}px`;
    this.selection.style.top = `${rect.y}px`;
    this.selection.style.width = `${rect.width}px`;
    this.selection.style.height = `${rect.height}px`;
    this.selection.classList.add('lb-overlay-selection--visible');
  }

  resetSelection() {
    this.selection.classList.remove('lb-overlay-selection--visible');
    this.selection.style.width = '0';
    this.selection.style.height = '0';
    this.loading.classList.remove('lb-overlay-loading--visible');
  }

  onMouseDown(event) {
    if (this.state === 'reading') {
      return;
    }

    if (event.target === this.cancelButton) {
      return;
    }

    event.preventDefault();
    this.dragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.setState('dragging');
    this.updateSelection(normalizeRect(this.startX, this.startY, this.startX, this.startY));
  }

  onMouseMove(event) {
    if (!this.dragging || this.state !== 'dragging') {
      return;
    }

    this.updateSelection(
      normalizeRect(this.startX, this.startY, event.clientX, event.clientY),
    );
  }

  onMouseUp(event) {
    if (!this.dragging || this.state !== 'dragging') {
      return;
    }

    this.dragging = false;
    const rect = normalizeRect(this.startX, this.startY, event.clientX, event.clientY);

    if (rect.width < MIN_SELECTION_WIDTH || rect.height < MIN_SELECTION_HEIGHT) {
      this.resetSelection();
      this.setState('idle');
      return;
    }

    this.startReading({
      ...rect,
      refWidth: window.innerWidth,
      refHeight: window.innerHeight,
    });
  }

  startReading(cropBox) {
    debug('overlay', 'Área selecionada — iniciando leitura', cropBox);

    this.setState('reading');
    this.scrim.classList.add('lb-overlay-scrim--disabled');
    this.hideForCapture();

    const runCapture = () => {
      readBarcodeFromCropBox(cropBox).then(this.onSuccess).catch(this.onFail);
    };

    // Aguarda o browser repintar sem o overlay na área do código
    requestAnimationFrame(() => {
      requestAnimationFrame(runCapture);
    });
  }

  hideForCapture() {
    this.selection.classList.remove('lb-overlay-selection--visible');
    this.selection.style.display = 'none';
    this.scrim.style.display = 'none';
  }

  onSuccess(barcode) {
    debug('overlay', 'Leitura bem-sucedida', { barcode: barcode.barcode });
    this.destroy();
    showBoletoResult(barcode.barcode);
  }

  onFail(error) {
    debugError('overlay', 'Falha na leitura', error);
    this.destroy();
    showErrorDialog(READ_FAIL_MESSAGE);
  }

  onCancel(event) {
    event.stopPropagation();
    this.destroy();
  }

  cancel() {
    this.destroy();
  }

  toggle() {
    debug('overlay', 'toggle()', { started: this.started });
    if (this.started) {
      this.cancel();
    } else {
      this.start();
    }
  }

  isStarted() {
    return this.started;
  }

  destroy() {
    if (!this.started) {
      return;
    }

    debug('overlay', 'Destruindo overlay');

    this.scrim.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.cancelButton.removeEventListener('click', this.onCancel);

    document.body.removeChild(this.root);
    this.started = false;
    this.state = 'idle';
    this.dragging = false;
  }
}
