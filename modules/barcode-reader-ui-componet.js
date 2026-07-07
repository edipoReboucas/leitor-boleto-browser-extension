var barcodeReaderModuleAlreadyLoaded;

if (!barcodeReaderModuleAlreadyLoaded) {
  var BarcodeReaderUIComponent = class {

    constructor() {
      this.started = false;
    }
  
    start() {
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
  
      this.rule.style.top = 0;
      this.rule.style.left = 0;
  
      this.overlay.style.top = 0;
      this.overlay.style.left = 0;
      this.overlay.style.position = 'fixed';
      this.overlay.style.display = 'none';
      this.overlay.style.top = 0;
      this.overlay.style.left = 0;
      this.overlay.style.width = '100%';
      this.overlay.style.height = '100%';
      this.overlay.style.zIndex = '9999999';
      this.overlay.style.cursor = 'crosshair';
  
      this.rule.style.position = 'fixed';
      this.rule.style.display = 'none';
      this.rule.style.top = 0;
      this.rule.style.left = 0;
      this.rule.style.width = 0;
      this.rule.style.height = 0;
      this.rule.style.boxShadow = '0 0 0 99999px rgba(0, 0, 0, .8)'
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
  
    toogle() {
      if (this.started) {
        this.cancel();
      } else {
        this.start();
      }
    }
  
    onMouseMove(event) {
      if (this.ruleStatus == 1) {
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
      if (this.ruleStatus == 0) {
        this.ruleStartX = event.clientX;
        this.ruleStartY = event.clientY;
        this.ruleStatus = 1;
      } else if (this.ruleStatus == 1){
        this.ruleStatus = 2;
        this.ruleEndX = event.clientX;
        this.ruleEndY = event.clientY;
    
        if (this.ruleEndX > this.ruleStartX) {
          this.cropBoxX = this.ruleStartX;
          this.cropBoxWidth =  this.ruleEndX - this.ruleStartX;
        } else {
          this.cropBoxX = this.ruleEndX;
          this.cropBoxWidth =  this.ruleStartX - this.ruleEndX;
        }
    
        if (this.ruleEndY > this.ruleStartY) {
          this.cropBoxY = this.ruleStartY;
          this.cropBoxHeight =  this.ruleEndY - this.ruleStartY;
        } else {
          this.cropBoxY = this.ruleEndY;
          this.cropBoxHeight =  this.ruleStartY - this.ruleEndY;
        }
        
        
        this.createCropBox()
        .then(readBarcode)
        .then(this.onSuccessListener)
        .catch(this.onFailListener);
      }
    }
  
    createCropBox() {
      return fromCropBox({ x :this.cropBoxX, y: this.cropBoxY, height :this.cropBoxHeight, width : this.cropBoxWidth, refWidth: window.innerWidth, refHeight: window.innerHeight });
    }
  
    show() { 
      this.overlay.style.display = 'block';
      this.rule.style.display = 'block';
    }
  
    showSuccess(barcode) {
      this.destroy();
      showBoletoResult(barcode.barcode);
    }

    showFail(barcode) {
      this.destroy();
      this.start();
      copyToClipboard(' ');
      alert('falha, tente novamente');
    }
  
    hide() {
      this.overlay.display = 'none';
      this.rule.style.display = 'none';
    }
  
    isStarted() {
      return this.started;
    }
  
    destroy() {
      window.removeEventListener('click', this.onClickListener);
      window.removeEventListener('mousemove', this.onMouseMoveListener);
      document.body.removeChild(this.overlay);
      this.started = false;
    }
  }
}

barcodeReaderModuleAlreadyLoaded = true;