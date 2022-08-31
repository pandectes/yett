import { clog } from './helpers';
import { isScanner } from './config';

const intervalId = setInterval(() => {
  if (window.Shopify) {
    clearInterval(intervalId);
    window.Shopify.loadFeatures(
      [
        {
          name: 'consent-tracking-api',
          version: '0.1',
        },
      ],
      (error) => {
        if (error) {
          clog('CustomerPrivacy API -> failed to load', 'warning');
          return;
        }
        clog('CustomerPrivacy API -> loaded successfully');
        if (isScanner) {
          window.Shopify.customerPrivacy.setTrackingConsent(true, (response) => {
            if (response && response.error) {
              clog('CustomerPrivacy API -> failed to allow tracking', 'error');
            }
            clog('CustomerPrivacy API -> tracking allowed');
          });
        }
      },
    );
  }
}, 10);
