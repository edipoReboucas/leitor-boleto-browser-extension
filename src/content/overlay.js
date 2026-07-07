import { readBarcodeFromCropBox } from './barcode-scanner.js';
import { showBoletoResult } from './boleto-formatter.js';
import { showErrorDialog } from './result-dialog.js';
import { debug, debugError } from '../shared/debug.js';

export class BarcodeReaderOverlay {
  constructor() {
    this.started = false;
  }

  start() {
    debug('overlay', 'Iniciando overlay de seleção');
    this.overlay = document.createElement('div');
    this.rule = document.createElement('div');

    this.ruleStatus = 0;

    this.ruleStartX = 0;
    this.ruleStartY = 0;

    this.ruleEndX = 0;
    this.ruleEndY = 0;

    this.cropBoxX = 0;
    this.cropBoxY = 0;

    this.cropBoxWidth = 0;
    this.cropBoxHeight = 0;

    document.body.appendChild(this.overlay);

    this.overlay.appendChild(this.rule);

    this.overlay.style.position = 'fixed';
    this.overlay.style.display = 'none';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.width = '100%';
    this.overlay.style.height = '100%';
    this.overlay.style.zIndex = '9999999';
    this.overlay.style.cursor = 'crosshair';

    this.rule.style.position = 'fixed';
    this.rule.style.display = 'none';
    this.rule.style.top = '0';
    this.rule.style.left = '0';
    this.rule.style.width = '0';
    this.rule.style.height = '0';
    this.rule.style.boxShadow = '0 0 0 99999px rgba(0, 0, 0, .8)';
    this.rule.style.zIndex = '9999999';

    this.onClickListener = this.onClick.bind(this);
    this.onMouseMoveListener = this.onMouseMove.bind(this);
    this.onSuccessListener = this.showSuccess.bind(this);
    this.onFailListener = this.showFail.bind(this);

    window.addEventListener('click', this.onClickListener);
    window.addEventListener('mousemove', this.onMouseMoveListener);

    this.show();
    this.started = true;
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

  onMouseMove(event) {
    if (this.ruleStatus === 1) {
      if (event.clientY > this.ruleStartY) {
        this.rule.style.top = this.ruleStartY + 'px';
        this.rule.style.height = event.clientY - this.ruleStartY + 'px';
      } else {
        this.rule.style.top = event.clientY + 'px';
        this.rule.style.height = this.ruleStartY - event.clientY + 'px';
      }

      if (event.clientX > this.ruleStartX) {
        this.rule.style.left = this.ruleStartX + 'px';
        this.rule.style.width = event.clientX - this.ruleStartX + 'px';
      } else {
        this.rule.style.left = event.clientX + 'px';
        this.rule.style.width = this.ruleStartX - event.clientX + 'px';
      }
    }
  }

  onClick(event) {
    if (this.ruleStatus === 0) {
      this.ruleStartX = event.clientX;
      this.ruleStartY = event.clientY;
      this.ruleStatus = 1;
    } else if (this.ruleStatus === 1) {
      this.ruleStatus = 2;
      this.ruleEndX = event.clientX;
      this.ruleEndY = event.clientY;

      if (this.ruleEndX > this.ruleStartX) {
        this.cropBoxX = this.ruleStartX;
        this.cropBoxWidth = this.ruleEndX - this.ruleStartX;
      } else {
        this.cropBoxX = this.ruleEndX;
        this.cropBoxWidth = this.ruleStartX - this.ruleEndX;
      }

      if (this.ruleEndY > this.ruleStartY) {
        this.cropBoxY = this.ruleStartY;
        this.cropBoxHeight = this.ruleEndY - this.ruleStartY;
      } else {
        this.cropBoxY = this.ruleEndY;
        this.cropBoxHeight = this.ruleStartY - this.ruleEndY;
      }

      const cropBox = {
        x: this.cropBoxX,
        y: this.cropBoxY,
        height: this.cropBoxHeight,
        width: this.cropBoxWidth,
        refWidth: window.innerWidth,
        refHeight: window.innerHeight,
      };

      debug('overlay', 'Área selecionada — iniciando leitura', cropBox);

      readBarcodeFromCropBox(cropBox)
        .then(this.onSuccessListener)
        .catch(this.onFailListener);
    }
  }

  show() {
    this.overlay.style.display = 'block';
    this.rule.style.display = 'block';
  }

  showSuccess(barcode) {
    debug('overlay', 'Leitura bem-sucedida', { barcode: barcode.barcode });
    this.destroy();
    showBoletoResult(barcode.barcode);
  }

  showFail(error) {
    debugError('overlay', 'Falha na leitura', error);
    this.destroy();
    showErrorDialog(
      'Falha na leitura. Clique no ícone da extensão para tentar novamente.',
    );
  }

  hide() {
    this.overlay.style.display = 'none';
    this.rule.style.display = 'none';
  }

  isStarted() {
    return this.started;
  }

  destroy() {
    debug('overlay', 'Destruindo overlay');
    window.removeEventListener('click', this.onClickListener);
    window.removeEventListener('mousemove', this.onMouseMoveListener);
    document.body.removeChild(this.overlay);
    this.started = false;
  }
}
