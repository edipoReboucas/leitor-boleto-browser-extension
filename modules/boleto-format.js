var boletoFormatModuleAlreadyLoaded;

if (!boletoFormatModuleAlreadyLoaded) {
  var formatBoleto = (rawCode) => {
    const digits = rawCode.replace(/\D/g, '');
    const tipoCodigo = BoletoUtils.identificarTipoCodigo(digits);

    if (tipoCodigo === 'CODIGO_DE_BARRAS') {
      return {
        codigoBarras: digits,
        linhaDigitavel: BoletoUtils.codBarras2LinhaDigitavel(digits, true)
      };
    }

    if (tipoCodigo === 'LINHA_DIGITAVEL') {
      const codigoBarras = BoletoUtils.linhaDigitavel2CodBarras(digits);

      return {
        codigoBarras,
        linhaDigitavel: BoletoUtils.codBarras2LinhaDigitavel(codigoBarras, true)
      };
    }

    throw new Error('Código inválido: esperado 44 ou 47 dígitos');
  };

  var copyToClipboard = (text) => {
    const input = document.createElement('textarea');
    input.style.position = 'fixed';
    input.style.opacity = 0;
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);
  };

  var showBoletoResult = (rawCode) => {
    try {
      const formatted = formatBoleto(rawCode);
      window.setTimeout(() => alert(formatted.linhaDigitavel), 500);
      copyToClipboard(formatted.linhaDigitavel);
    } catch (error) {
      window.setTimeout(() => alert('Código lido é inválido para boleto'), 500);
    }
  };
}

boletoFormatModuleAlreadyLoaded = true;
