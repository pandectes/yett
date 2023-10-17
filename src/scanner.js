import { SCANNER_EVENT } from './constants';

export function checkIsScanner() {
  if (typeof dataLayer !== 'undefined') {
    if (Array.isArray(dataLayer)) {
      const eventExists = dataLayer.some((item) => item.event === SCANNER_EVENT);
      if (eventExists) {
        return true;
      }
    }
  }
  return false;
}
