import { clog } from './helpers';
import { isScanner, actualPreferences } from './config';
import { globalSettings } from './settings';

export const {
  store: { adminMode },
  blocker,
} = globalSettings;

function shopifyCommand(cb) {
  let intervalId = null;
  if (!window.Shopify || !window.Shopify.loadFeatures || !window.Shopify.trackingConsent) {
    intervalId = setInterval(() => {
      if (window.Shopify && window.Shopify.loadFeatures) {
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
              clog('Shopify.customerPrivacy API - failed to load');
              return;
            }
            clog('Shopify.customerPrivacy API - loaded');
            clog(
              'Shopify.customerPrivacy.userCanBeTracked() default value: ' +
                window.Shopify.trackingConsent.userCanBeTracked(),
            );
            cb();
          },
        );
      }
    }, 10);
  } else {
    cb();
  }
}

// const intervalId = setInterval(() => {
//   if (window.Shopify) {
//     clearInterval(intervalId);
//     if (window.Shopify.loadFeatures) {
//       window.Shopify.loadFeatures(
//         [
//           {
//             name: 'consent-tracking-api',
//             version: '0.1',
//           },
//         ],
//         (error) => {
//           if (error) {
//             clog('CustomerPrivacy API -> failed to load', 'warning');
//             return;
//           }
//           clog('CustomerPrivacy API -> loaded successfully');

//           const allowTracking = (actualPreferences & 2) === 0 || (actualPreferences & 4) === 0;
//           if (isScanner || allowTracking) {
//             window.Shopify.customerPrivacy.setTrackingConsent(true, (response) => {
//               if (response && response.error) {
//                 clog('CustomerPrivacy API -> failed to allow tracking', 'error');
//               } else {
//                 clog('CustomerPrivacy API (Rules) -> tracking allowed');
//               }
//             });
//           }

//           // CCPA
//           if (blocker.gpcIsActive && window.Shopify.customerPrivacy.getRegulation() === 'CCPA') {
//             const value = navigator.globalPrivacyControl;
//             if (value !== undefined) {
//               window.Shopify.customerPrivacy.setCCPAConsent(!value, (response) => {
//                 if (response && response.error) {
//                   clog('CustomerPrivacy API -> failed to set CCPA consent', 'error');
//                 } else {
//                   clog('CustomerPrivacy API (Rules) -> CCPA data sell ' + (value ? 'disallowed' : 'allowed'));
//                 }
//               });
//             } else {
//               clog('navigator.globalPrivacyControl is not set');
//             }
//           }
//         },
//       );
//     }
//   }
// }, 10);

function handleCcpa() {
  const api = window.Shopify.trackingConsent;
  const currentConsent = api.currentVisitorConsent();
  if (
    blocker.gpcIsActive &&
    api.getRegulation() === 'CCPA' &&
    currentConsent.gpc === 'no' &&
    currentConsent.sale_of_data !== 'yes'
  ) {
    const setConsentTo = { sale_of_data: false };
    api.setTrackingConsent(setConsentTo, function (response) {
      if (response && response.error) {
        clog(`Shopify.customerPrivacy API - failed to setTrackingConsent({${JSON.stringify(setConsentTo)})`);
        return;
      }
      clog(`Shopify.customerPrivacy API - setTrackingConsent(${JSON.stringify(setConsentTo)})`);
    });
  }
}

function handleGdpr() {
  const api = window.Shopify.trackingConsent;
  try {
    const hideNoAdmin = adminMode && !window.Shopify.AdminBarInjector;
    const setConsentTo = {
      preferences: (actualPreferences & 1) === 0 || isScanner || hideNoAdmin,
      analytics: (actualPreferences & 2) === 0 || isScanner || hideNoAdmin,
      marketing: (actualPreferences & 4) === 0 || isScanner || hideNoAdmin,
    };
    if (
      api.firstPartyMarketingAllowed() !== setConsentTo.marketing ||
      api.analyticsProcessingAllowed() !== setConsentTo.analytics ||
      api.preferencesProcessingAllowed() !== setConsentTo.preferences
    ) {
      api.setTrackingConsent(setConsentTo, function (response) {
        if (response && response.error) {
          clog(`Shopify.customerPrivacy API - failed to setTrackingConsent`);
          return;
        }
        clog(`Shopify.customerPrivacy API - setTrackingConsent(${JSON.stringify(setConsentTo)})`);
      });
    }
  } catch (e) {
    clog('Shopify.customerPrivacy API - exception');
  }
}

shopifyCommand(() => {
  handleGdpr();
  handleCcpa();
});
