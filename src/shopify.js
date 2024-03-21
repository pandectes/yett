import { clog } from './helpers';
import { isScanner, actualPreferences, storedPreferences } from './config';
import { globalSettings } from './settings';

export const {
  store: { adminMode },
  blocker,
} = globalSettings;

const { defaultBlocked } = blocker;

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
            clog(
              `shouldShowBanner() -> ${window.Shopify.trackingConsent.shouldShowBanner()} | saleOfDataRegion() -> ${window.Shopify.trackingConsent.saleOfDataRegion()}`,
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
      clog(`setTrackingConsent(${JSON.stringify(setConsentTo)})`);
    });
  }
}

function handleGdpr() {
  const api = window.Shopify.trackingConsent;

  if (api.shouldShowBanner() === false) {
    // loose policy
    if (storedPreferences === null && defaultBlocked === 7) {
      // if the store has strick setup, you should not send the fake command
      return;
    }
  }

  try {
    const hideNoAdmin = adminMode && !(window.Shopify && window.Shopify.AdminBarInjector);
    let setConsentTo = {
      preferences: (actualPreferences & 1) === 0 || isScanner || hideNoAdmin,
      analytics: (actualPreferences & 2) === 0 || isScanner || hideNoAdmin,
      marketing: (actualPreferences & 4) === 0 || isScanner || hideNoAdmin,
    };
    if (
      api.firstPartyMarketingAllowed() !== setConsentTo.marketing ||
      api.analyticsProcessingAllowed() !== setConsentTo.analytics ||
      api.preferencesProcessingAllowed() !== setConsentTo.preferences
    ) {
      if (setConsentTo.preferences && setConsentTo.analytics && setConsentTo.marketing) {
        setConsentTo = true;
      }
      api.setTrackingConsent(setConsentTo, function (response) {
        if (response && response.error) {
          clog(`Shopify.customerPrivacy API - failed to setTrackingConsent`);
          return;
        }
        clog(`setTrackingConsent(${JSON.stringify(setConsentTo)})`);
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
