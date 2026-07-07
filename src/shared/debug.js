const PREFIX = '[LeitorBoleto]';
const ENABLED = __LB_DEBUG__;

export function debug(scope, message, data) {
  if (!ENABLED) {
    return;
  }

  if (data !== undefined) {
    console.log(`${PREFIX} [${scope}]`, message, data);
    return;
  }

  console.log(`${PREFIX} [${scope}]`, message);
}

export function debugWarn(scope, message, data) {
  if (!ENABLED) {
    return;
  }

  if (data !== undefined) {
    console.warn(`${PREFIX} [${scope}]`, message, data);
    return;
  }

  console.warn(`${PREFIX} [${scope}]`, message);
}

export function debugError(scope, message, error) {
  if (!ENABLED) {
    return;
  }

  if (error !== undefined) {
    console.error(`${PREFIX} [${scope}]`, message, error);
    return;
  }

  console.error(`${PREFIX} [${scope}]`, message);
}

export function getRuntimeError() {
  return chrome.runtime.lastError?.message;
}
