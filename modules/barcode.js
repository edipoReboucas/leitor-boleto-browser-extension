var barcodeModuleAlreadyLoaded;

if (!barcodeModuleAlreadyLoaded) {
  var barcodePrototype = {
    cropBox:  { 
      x: 0, 
      y: 0, 
      width: 0, 
      height: 0, 
      refWidth: 0,
      refHeight: 0
    },
    visibleTabImage: null,
    barcodeImage: null,
    barcode: ''
  };
  
  
  var fromCropBox = cropBox => new Promise(resolve => {
    resolve({ 
      ...barcodePrototype,
      cropBox
    });
  });
  
  var readBarcode = barcode => new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'readBarcode', cropBox: barcode.cropBox }, function(response) {
      if (!response || !response.visibleTabImageDataURL) {
        return reject(barcode);
      }

      captureVisibleTabImage({ ...barcode, visibleTabImageDataURL: response.visibleTabImageDataURL })
        .then(cropBarcodeImage)
        .then(readBarcodeFromImage)
        .then(resolve)
        .catch(reject);
    });
  });

  var captureVisibleTabImage = barcode => new Promise((resolve, reject) => {
    const { cropBox, visibleTabImageDataURL } = barcode;
    const visibleTabImageElement = document.createElement('img');
    visibleTabImageElement.src = visibleTabImageDataURL;

    visibleTabImageElement.onload = () => {
      var visibleTabImage = document.createElement('canvas');
      visibleTabImage.width = cropBox.refWidth;
      visibleTabImage.height = cropBox.refHeight;
      visibleTabImage
        .getContext('2d')
        .drawImage(
          visibleTabImageElement,
          0, 0,
          visibleTabImageElement.width, visibleTabImageElement.height,
          0, 0,
          visibleTabImage.width, visibleTabImage.height
        );

      resolve({
        ...barcode,
        visibleTabImage
      });
    };

    visibleTabImageElement.onerror = () => reject(barcode);
  });
  
  var cropBarcodeImage = barcode => new Promise((resolve, reject) => {
    const { cropBox, visibleTabImage } = barcode;
    const barcodeImage = document.createElement('canvas');
    barcodeImage.width = cropBox.width;
    barcodeImage.height = cropBox.height;
    
    barcodeImage
    .getContext('2d')
    .drawImage(visibleTabImage, cropBox.x, cropBox.y, cropBox.width, cropBox.height, 0, 0, cropBox.width, cropBox.height);
  
    resolve({
      ...barcode,
      barcodeImage
    });
  });
  
  
  var readBarcodeFromImage =  barcode => new Promise((resolve, reject) => {
    const { cropBox, barcodeImage } = barcode;
    const imageData = barcodeImage.getContext('2d').getImageData(0, 0, cropBox.width, cropBox.height);
  
    readBarcodeFromImageData(imageData).then(code => {
      resolve({
        ...barcode,
        barcode: code
      });
    }).catch(() => {
      reject({
        ...barcode,
        barcode: ''
      });
    });
  });
  
  var readBarcodeFromImageData = imageData => {
    return javascriptBarcodeReader(
      imageData,
      {
        barcode: 'code-2of5',
        type: 'interleaved', //optional type
      }
    ).then(code => {
      const filteredCode = code.replace(/[^0-9]/);
      if (filteredCode == code && code.length == 44) {
        return filteredCode;
      }
  
      return Promise.reject('');
    });
  };
}

barcodeModuleAlreadyLoaded = true;