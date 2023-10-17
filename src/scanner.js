import { SCANNER_EVENT } from './constants';

export function checkIsScanner() {
  if (typeof window.dataLayer !== 'undefined') {
    if (Array.isArray(window.dataLayer)) {
      const eventExists = window.dataLayer.some((item) => item.event === SCANNER_EVENT);
      if (eventExists) {
        return true;
      }
    }
  }
  return false;
}
