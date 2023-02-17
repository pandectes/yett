import { clog } from './helpers';
import { isScanner, actualPreferences } from './config';

const { blocker } = window.PandectesSettings;

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
              } else {
                clog('CustomerPrivacy API (Rules) -> tracking allowed');
              }
            });
          }

          // CCPA
          if (blocker.gpcIsActive && window.Shopify.customerPrivacy.getRegulation() === 'CCPA') {
            const value = navigator.globalPrivacyControl;
            if (value !== undefined) {
              window.Shopify.customerPrivacy.setCCPAConsent(!value, (response) => {
                if (response && response.error) {
                  clog('CustomerPrivacy API -> failed to set CCPA consent', 'error');
                } else {
                  clog('CustomerPrivacy API (Rules) -> CCPA data sell ' + (value ? 'disallowed' : 'allowed'));
                }
              });
            } else {
              clog('navigator.globalPrivacyControl is not set');
            }
          }
        },
      );
    }
  }
}, 10);
