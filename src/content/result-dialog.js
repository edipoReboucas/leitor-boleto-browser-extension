import dialogCss from './result-dialog.css';
import { copyToClipboard } from '../shared/clipboard.js';

const STYLES_ID = 'lb-ext-styles';
const ROOT_ID = 'lb-ext-root';

function injectStyles() {
  if (document.getElementById(STYLES_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLES_ID;
  style.textContent = dialogCss;
  document.head.appendChild(style);
}

function getRoot() {
  injectStyles();
  let root = document.getElementById(ROOT_ID);

  if (!root) {
    root = document.createElement('div');
    root.id = ROOT_ID;
    document.body.appendChild(root);
  }

  return root;
}

function closeDialog() {
  const root = document.getElementById(ROOT_ID);

  if (!root) {
    return;
  }

  root.innerHTML = '';
}

function onEscapeKey(event) {
  if (event.key === 'Escape') {
    closeDialog();
    document.removeEventListener('keydown', onEscapeKey);
  }
}

function showSnackbar(message) {
  const root = getRoot();
  const existing = root.querySelector('.lb-snackbar');

  if (existing) {
    existing.remove();
  }

  const snackbar = document.createElement('div');
  snackbar.className = 'lb-snackbar';
  snackbar.textContent = message;
  root.appendChild(snackbar);

  window.setTimeout(() => {
    snackbar.remove();

    if (!root.querySelector('.lb-dialog') && !root.querySelector('.lb-snackbar')) {
      root.remove();
    }
  }, 3000);
}

function createDialog(options) {
  const root = getRoot();
  root.innerHTML = '';

  const scrim = document.createElement('div');
  scrim.className = 'lb-scrim';
  scrim.addEventListener('click', () => {
    closeDialog();
    document.removeEventListener('keydown', onEscapeKey);
  });

  const dialog = document.createElement('div');
  dialog.className = options.code ? 'lb-dialog lb-dialog--boleto' : 'lb-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');

  const header = document.createElement('div');
  header.className = 'lb-dialog-header';

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('class', 'lb-dialog-icon lb-dialog-icon--' + options.variant);
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('fill', 'currentColor');

  const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  iconPath.setAttribute(
    'd',
    options.variant === 'success'
      ? 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
      : 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  );
  icon.appendChild(iconPath);

  const title = document.createElement('h2');
  title.className = 'lb-dialog-title';
  title.textContent = options.title;

  header.appendChild(icon);
  header.appendChild(title);
  dialog.appendChild(header);

  if (options.code) {
    const label = document.createElement('p');
    label.className = 'lb-dialog-label';
    label.textContent = 'Linha digitável';

    const code = document.createElement('p');
    code.className = 'lb-dialog-code';
    code.textContent = options.code;

    dialog.appendChild(label);
    dialog.appendChild(code);
  }

  if (options.message) {
    const message = document.createElement('p');
    message.className = 'lb-dialog-message';
    message.textContent = options.message;
    dialog.appendChild(message);
  }

  const actions = document.createElement('div');
  actions.className = 'lb-dialog-actions';

  const closeButton = document.createElement('button');
  closeButton.className = 'lb-btn lb-btn-text';
  closeButton.textContent = 'Fechar';
  closeButton.addEventListener('click', () => {
    closeDialog();
    document.removeEventListener('keydown', onEscapeKey);
  });

  actions.appendChild(closeButton);

  if (options.code) {
    const copyButton = document.createElement('button');
    copyButton.className = 'lb-btn lb-btn-filled';
    copyButton.textContent = 'Copiar';
    copyButton.addEventListener('click', () => {
      copyToClipboard(options.code);
      showSnackbar('Copiado para a área de transferência');
    });
    actions.appendChild(copyButton);
  }

  dialog.appendChild(actions);
  root.appendChild(scrim);
  root.appendChild(dialog);

  document.addEventListener('keydown', onEscapeKey);
}

export function showResultDialog(linhaDigitavel) {
  createDialog({
    variant: 'success',
    title: 'Boleto lido com sucesso',
    code: linhaDigitavel,
  });

  copyToClipboard(linhaDigitavel);
  showSnackbar('Copiado para a área de transferência');
}

export function showErrorDialog(message) {
  createDialog({
    variant: 'error',
    title: 'Não foi possível ler',
    message,
  });
}
