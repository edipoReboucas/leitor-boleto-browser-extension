import * as BoletoUtils from '@mrmgomes/boleto-utils';
import { showResultDialog, showErrorDialog } from './result-dialog.js';
import { debug, debugError } from '../shared/debug.js';

function formatBoleto(rawCode) {
  const digits = rawCode.replace(/\D/g, '');
  const tipoCodigo = BoletoUtils.identificarTipoCodigo(digits);

  if (tipoCodigo === 'CODIGO_DE_BARRAS') {
    return {
      codigoBarras: digits,
      linhaDigitavel: BoletoUtils.codBarras2LinhaDigitavel(digits, true),
    };
  }

  if (tipoCodigo === 'LINHA_DIGITAVEL') {
    const codigoBarras = BoletoUtils.linhaDigitavel2CodBarras(digits);

    return {
      codigoBarras,
      linhaDigitavel: BoletoUtils.codBarras2LinhaDigitavel(codigoBarras, true),
    };
  }

  throw new Error('Código inválido: esperado 44 ou 47 dígitos');
}

function formatLinhaDigitavelDisplay(linha) {
  if (linha.includes('.')) {
    return linha;
  }

  const digits = linha.replace(/\D/g, '');

  if (digits.length === 44) {
    return BoletoUtils.codBarras2LinhaDigitavel(digits, true);
  }

  if (digits.length === 47) {
    const codigoBarras = BoletoUtils.linhaDigitavel2CodBarras(digits);
    return BoletoUtils.codBarras2LinhaDigitavel(codigoBarras, true);
  }

  if (digits.length === 48) {
    const blocks = [
      digits.slice(0, 12),
      digits.slice(12, 24),
      digits.slice(24, 36),
      digits.slice(36, 48),
    ];

    return blocks.map((block) => block.slice(0, 5) + '.' + block.slice(5)).join(' ');
  }

  return linha;
}

export function showBoletoResult(rawCode) {
  debug('formatter', 'Formatando resultado', { rawCode });

  try {
    const formatted = formatBoleto(rawCode);
    const displayLinha = formatLinhaDigitavelDisplay(formatted.linhaDigitavel);
    debug('formatter', 'Linha digitável formatada', { displayLinha });
    window.setTimeout(() => showResultDialog(displayLinha), 300);
  } catch (error) {
    debugError('formatter', 'Código inválido para boleto', error);
    window.setTimeout(
      () => showErrorDialog('Código lido é inválido para boleto'),
      300,
    );
  }
}
