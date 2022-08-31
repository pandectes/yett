import { clog } from './helpers';
import { storedPreferences, actualPreferences, categoryAllowed } from './config';

const {
  banner: { isActive: isBannerActive },
  blocker: {
    googleConsentMode: {
      isActive: isGcmActive,
      customEvent,
      redactData,
      urlPassthrough,
      adStorageCategory,
      analyticsStorageCategory,
      functionalityStorageCategory,
      personalizationStorageCategory,
      securityStorageCategory,
    },
  },
} = window.PandectesSettings;

// initialize data layer
window.dataLayer = window.dataLayer || [];

// gtag function
function gtag() {
  window.dataLayer.push(arguments);
}

export function pushCustomEvent(preferences) {
  let status;
  if (preferences === 7) {
    status = 'deny';
  } else if (preferences === 0) {
    status = 'allow';
  } else {
    status = 'mixed';
  }
  window.dataLayer.push({
    event: 'Pandectes_Consent_Update',
    pandectes_status: status,
    pandectes_categories: {
      C000: 'allow',
      C001: categoryAllowed[1] ? 'allow' : 'deny',
      C002: categoryAllowed[2] ? 'allow' : 'deny',
      C003: categoryAllowed[4] ? 'allow' : 'deny',
    },
  });
}

const gcm = {
  hasInitialized: false,
  ads_data_redaction: false,
  url_passthrough: false,
  storage: {
    ad_storage: 'granted',
    analytics_storage: 'granted',
    functionality_storage: 'granted',
    personalization_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500,
  },
};

if (isBannerActive && isGcmActive) {
  const adConfig = (actualPreferences & adStorageCategory) === 0 ? 'granted' : 'denied';
  const analyticsConfig = (actualPreferences & analyticsStorageCategory) === 0 ? 'granted' : 'denied';
  const functionalityConfig = (actualPreferences & functionalityStorageCategory) === 0 ? 'granted' : 'denied';
  const personalizationConfig = (actualPreferences & personalizationStorageCategory) === 0 ? 'granted' : 'denied';
  const securityConfig = (actualPreferences & securityStorageCategory) === 0 ? 'granted' : 'denied';

  gcm.hasInitialized = true;
  gcm.ads_data_redaction = adConfig === 'denied' && redactData;
  gcm.url_passthrough = urlPassthrough;
  gcm.storage.ad_storage = adConfig;
  gcm.storage.analytics_storage = analyticsConfig;
  gcm.storage.functionality_storage = functionalityConfig;
  gcm.storage.personalization_storage = personalizationConfig;
  gcm.storage.security_storage = securityConfig;

  gcm.ads_data_redaction && gtag('set', 'ads_data_redaction', gcm.ads_data_redaction);

  gcm.url_passthrough && gtag('set', 'url_passthrough', gcm.url_passthrough);

  gtag('consent', 'default', gcm.storage);
  if (customEvent) {
    if (storedPreferences === null || /\/checkouts\//.test(window.location.pathname)) {
      pushCustomEvent(actualPreferences);
    }
  }

  clog('Google consent mode initialized');
}

export default gcm;
