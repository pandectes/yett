import { clog } from './helpers';
import { isScanner, actualPreferences } from './config';

const intervalId = setInterval(() => {
  if (window.Shopify) {
    clearInterval(intervalId);
    if (window.Shopify.loadFeatures) {
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

          const allowTracking = (actualPreferences & 2) === 0 || (actualPreferences & 4) === 0;
          if (isScanner || allowTracking) {
            window.Shopify.customerPrivacy.setTrackingConsent(true, (response) => {
              if (response && response.error) {
                clog('CustomerPrivacy API -> failed to allow tracking', 'error');
              }
              clog('CustomerPrivacy API (Rules) -> tracking allowed');
            });
          }
        },
      );
    }
  }
}, 10);
