document.getElementById('open-extensions').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'openExtensionsPage' });
});
