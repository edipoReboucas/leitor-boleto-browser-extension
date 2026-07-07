var resultDialogModuleAlreadyLoaded;

if (!resultDialogModuleAlreadyLoaded) {
  var STYLES_ID = 'lb-ext-styles';
  var ROOT_ID = 'lb-ext-root';

  var injectStyles = () => {
    if (document.getElementById(STYLES_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLES_ID;
    style.textContent = `
      #${ROOT_ID} {
        --lb-primary: #1a73e8;
        --lb-on-primary: #ffffff;
        --lb-surface: #ffffff;
        --lb-on-surface: #1d1b20;
        --lb-on-surface-variant: #49454f;
        --lb-outline: #79747e;
        --lb-surface-container: #f3f3f3;
        --lb-error: #b3261e;
        --lb-scrim: rgba(0, 0, 0, 0.32);
        --lb-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
        font-family: 'Google Sans', Roboto, Arial, sans-serif;
        position: fixed;
        inset: 0;
        z-index: 10000000;
        pointer-events: none;
      }

      @media (prefers-color-scheme: dark) {
        #${ROOT_ID} {
          --lb-primary: #a8c7fa;
          --lb-on-primary: #062e6f;
          --lb-surface: #2b2930;
          --lb-on-surface: #e6e1e5;
          --lb-on-surface-variant: #cac4d0;
          --lb-outline: #938f99;
          --lb-surface-container: #36343b;
          --lb-error: #f2b8b5;
          --lb-scrim: rgba(0, 0, 0, 0.6);
          --lb-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
      }

      #${ROOT_ID} * {
        box-sizing: border-box;
      }

      #${ROOT_ID} .lb-scrim {
        position: fixed;
        inset: 0;
        background: var(--lb-scrim);
        pointer-events: auto;
        animation: lb-fade-in 200ms ease;
      }

      #${ROOT_ID} .lb-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(400px, calc(100vw - 32px));
        background: var(--lb-surface);
        color: var(--lb-on-surface);
        border-radius: 28px;
        box-shadow: var(--lb-shadow);
        padding: 24px;
        pointer-events: auto;
        animation: lb-scale-in 200ms cubic-bezier(0.2, 0, 0, 1);
      }

      #${ROOT_ID} .lb-dialog--boleto {
        width: min(580px, calc(100vw - 32px));
      }

      #${ROOT_ID} .lb-dialog-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }

      #${ROOT_ID} .lb-dialog-icon {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      #${ROOT_ID} .lb-dialog-icon--success {
        color: #1e8e3e;
      }

      #${ROOT_ID} .lb-dialog-icon--error {
        color: var(--lb-error);
      }

      #${ROOT_ID} .lb-dialog-title {
        font-size: 22px;
        font-weight: 500;
        line-height: 28px;
        margin: 0;
      }

      #${ROOT_ID} .lb-dialog-label {
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.5px;
        color: var(--lb-on-surface-variant);
        margin: 0 0 8px;
        text-transform: uppercase;
      }

      #${ROOT_ID} .lb-dialog-code {
        background: var(--lb-surface-container);
        border: 1px solid var(--lb-outline);
        border-radius: 12px;
        padding: 16px;
        font-family: 'Roboto Mono', 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.6;
        white-space: nowrap;
        overflow-x: auto;
        color: var(--lb-on-surface);
        margin: 0 0 24px;
      }

      #${ROOT_ID} .lb-dialog-message {
        font-size: 14px;
        line-height: 20px;
        color: var(--lb-on-surface-variant);
        margin: 0 0 24px;
      }

      #${ROOT_ID} .lb-dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      #${ROOT_ID} .lb-btn {
        border: none;
        border-radius: 20px;
        padding: 10px 24px;
        font-size: 14px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: background 150ms ease;
      }

      #${ROOT_ID} .lb-btn-text {
        background: transparent;
        color: var(--lb-primary);
      }

      #${ROOT_ID} .lb-btn-text:hover {
        background: rgba(26, 115, 232, 0.08);
      }

      #${ROOT_ID} .lb-btn-filled {
        background: var(--lb-primary);
        color: var(--lb-on-primary);
      }

      #${ROOT_ID} .lb-btn-filled:hover {
        filter: brightness(1.08);
      }

      #${ROOT_ID} .lb-snackbar {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: #323232;
        color: #ffffff;
        padding: 14px 24px;
        border-radius: 4px;
        font-size: 14px;
        pointer-events: auto;
        animation: lb-slide-up 200ms ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        white-space: nowrap;
      }

      @keyframes lb-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes lb-scale-in {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }

      @keyframes lb-slide-up {
        from { opacity: 0; transform: translateX(-50%) translateY(16px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;

    document.head.appendChild(style);
  };

  var getRoot = () => {
    injectStyles();
    let root = document.getElementById(ROOT_ID);

    if (!root) {
      root = document.createElement('div');
      root.id = ROOT_ID;
      document.body.appendChild(root);
    }

    return root;
  };

  var copyToClipboard = (text) => {
    const input = document.createElement('textarea');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);
  };

  var closeDialog = () => {
    const root = document.getElementById(ROOT_ID);

    if (!root) {
      return;
    }

    root.innerHTML = '';
  };

  var onEscapeKey = (event) => {
    if (event.key === 'Escape') {
      closeDialog();
      document.removeEventListener('keydown', onEscapeKey);
    }
  };

  var showSnackbar = (message) => {
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
  };

  var createDialog = (options) => {
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
    iconPath.setAttribute('d', options.variant === 'success'
      ? 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
      : 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z');
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
  };

  var showResultDialog = (linhaDigitavel) => {
    createDialog({
      variant: 'success',
      title: 'Boleto lido com sucesso',
      code: linhaDigitavel
    });

    copyToClipboard(linhaDigitavel);
    showSnackbar('Copiado para a área de transferência');
  };

  var showErrorDialog = (message) => {
    createDialog({
      variant: 'error',
      title: 'Não foi possível ler',
      message: message
    });
  };
}

resultDialogModuleAlreadyLoaded = true;
