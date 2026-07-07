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

  var showBoletoResult = (rawCode) => {
    try {
      const formatted = formatBoleto(rawCode);
      window.setTimeout(() => showResultDialog(formatted.linhaDigitavel), 300);
    } catch (error) {
      window.setTimeout(() => showErrorDialog('Código lido é inválido para boleto'), 300);
    }
  };
}

boletoFormatModuleAlreadyLoaded = true;
