import javascriptBarcodeReader from 'javascript-barcode-reader/dist/javascript-barcode-reader.umd.min.js';
import { MessageType } from '../shared/messaging.js';
import { debug, debugError, debugWarn, getRuntimeError } from '../shared/debug.js';

const barcodePrototype = {
  cropBox: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    refWidth: 0,
    refHeight: 0,
  },
  visibleTabImage: null,
  barcodeImage: null,
  barcode: '',
};

function fromCropBox(cropBox) {
  return Promise.resolve({
    ...barcodePrototype,
    cropBox,
  });
}

function captureVisibleTabImage(barcode) {
  return new Promise((resolve, reject) => {
    const { cropBox, visibleTabImageDataURL } = barcode;
    const visibleTabImageElement = document.createElement('img');
    visibleTabImageElement.src = visibleTabImageDataURL;

    visibleTabImageElement.onload = () => {
      const visibleTabImage = document.createElement('canvas');
      visibleTabImage.width = cropBox.refWidth;
      visibleTabImage.height = cropBox.refHeight;
      visibleTabImage
        .getContext('2d')
        .drawImage(
          visibleTabImageElement,
          0,
          0,
          visibleTabImageElement.width,
          visibleTabImageElement.height,
          0,
          0,
          visibleTabImage.width,
          visibleTabImage.height,
        );

      resolve({
        ...barcode,
        visibleTabImage,
      });
    };

    visibleTabImageElement.onerror = () => {
      debugError('scanner', 'Falha ao carregar imagem capturada');
      reject(barcode);
    };
  });
}

function cropBarcodeImage(barcode) {
  return new Promise((resolve) => {
    const { cropBox, visibleTabImage } = barcode;
    const barcodeImage = document.createElement('canvas');
    barcodeImage.width = cropBox.width;
    barcodeImage.height = cropBox.height;

    barcodeImage
      .getContext('2d')
      .drawImage(
        visibleTabImage,
        cropBox.x,
        cropBox.y,
        cropBox.width,
        cropBox.height,
        0,
        0,
        cropBox.width,
        cropBox.height,
      );

    resolve({
      ...barcode,
      barcodeImage,
    });
  });
}

function readBarcodeFromImageData(imageData) {
  debug('scanner', 'Decodificando ImageData', {
    width: imageData.width,
    height: imageData.height,
  });

  return javascriptBarcodeReader({
    image: imageData,
    barcode: 'code-2of5',
    barcodeType: 'interleaved',
  })
    .then((code) => {
      const filteredCode = code.replace(/[^0-9]/g, '');
      debug('scanner', 'Código decodificado', { raw: code, filtered: filteredCode });

      if (filteredCode === code && code.length === 44) {
        return filteredCode;
      }

      debugWarn('scanner', 'Código inválido após decode', {
        raw: code,
        length: code.length,
        filteredLength: filteredCode.length,
      });
      return Promise.reject(new Error('Código decodificado inválido'));
    })
    .catch((error) => {
      debugError('scanner', 'Erro no decoder', error);
      return Promise.reject(error);
    });
}

function readBarcodeFromImage(barcode) {
  return new Promise((resolve, reject) => {
    const { cropBox, barcodeImage } = barcode;
    const imageData = barcodeImage
      .getContext('2d')
      .getImageData(0, 0, cropBox.width, cropBox.height);

    readBarcodeFromImageData(imageData)
      .then((code) => {
        resolve({
          ...barcode,
          barcode: code,
        });
      })
      .catch((error) => {
        debugError('scanner', 'readBarcodeFromImage falhou', error);
        reject({
          ...barcode,
          barcode: '',
        });
      });
  });
}

export function readBarcodeFromCropBox(cropBox) {
  debug('scanner', 'readBarcodeFromCropBox chamado', cropBox);

  return fromCropBox(cropBox).then((barcode) =>
    new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: MessageType.READ_BARCODE, cropBox: barcode.cropBox },
        (response) => {
          const runtimeError = getRuntimeError();
          if (runtimeError) {
            debugError('scanner', 'Erro ao solicitar captura', runtimeError);
            reject(barcode);
            return;
          }

          if (!response?.visibleTabImageDataURL) {
            debugWarn('scanner', 'Resposta sem imagem', { response });
            reject(barcode);
            return;
          }

          debug('scanner', 'Imagem recebida do background', {
            dataUrlLength: response.visibleTabImageDataURL.length,
          });

          captureVisibleTabImage({
            ...barcode,
            visibleTabImageDataURL: response.visibleTabImageDataURL,
          })
            .then(cropBarcodeImage)
            .then(readBarcodeFromImage)
            .then((result) => {
              debug('scanner', 'Pipeline de leitura concluído', {
                barcode: result.barcode,
              });
              resolve(result);
            })
            .catch((error) => {
              debugError('scanner', 'Falha no pipeline de leitura', error);
              reject(error);
            });
        },
      );
    }),
  );
}
