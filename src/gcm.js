import { actualPreferences, categoryAllowed } from './config';
import { createScript } from './helpers';
import { globalSettings } from './settings';
import { EU_COUNTRY_CODES } from './counties';

const {
  banner: { isActive: isBannerActive, hybridStrict },
  geolocation: {
    caOnly = false,
    euOnly = false,
    brOnly = false,
    jpOnly = false,
    thOnly = false,
    chOnly = false,
    zaOnly = false,
    canadaOnly = false,
    globalVisibility = true,
  },
  blocker: {
    defaultBlocked = 7,
    googleConsentMode: {
      isActive: isGcmActive,
      customEvent,
      id = '',
      analyticsId = '',
      adwordsId = '',
      redactData,
      urlPassthrough,
      adStorageCategory,
      analyticsStorageCategory,
      functionalityStorageCategory,
      personalizationStorageCategory,
      securityStorageCategory,
      dataLayerProperty = 'dataLayer',
      waitForUpdate = 0,
      useNativeChannel = false,
    },
  },
} = globalSettings;

// initialize data layer
window[dataLayerProperty] = window[dataLayerProperty] || [];

// gtag function
function gtag() {
  window[dataLayerProperty].push(arguments);
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
  window[dataLayerProperty].push({
    event: 'Pandectes_Consent_Update',
    pandectes_status: status,
    pandectes_categories: {
      C0000: 'allow',
      C0001: categoryAllowed[1] ? 'allow' : 'deny',
      C0002: categoryAllowed[2] ? 'allow' : 'deny',
      C0003: categoryAllowed[4] ? 'allow' : 'deny',
    },
  });
}

const gcm = {
  hasInitialized: false,
  useNativeChannel: false,
  ads_data_redaction: false,
  url_passthrough: false,
  data_layer_property: 'dataLayer',
  storage: {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
    functionality_storage: 'granted',
    personalization_storage: 'granted',
    security_storage: 'granted',
  },
};

if (isBannerActive && isGcmActive) {
  const adConfig = (defaultBlocked & adStorageCategory) === 0 ? 'granted' : 'denied';
  const analyticsConfig = (defaultBlocked & analyticsStorageCategory) === 0 ? 'granted' : 'denied';
  const functionalityConfig = (defaultBlocked & functionalityStorageCategory) === 0 ? 'granted' : 'denied';
  const personalizationConfig = (defaultBlocked & personalizationStorageCategory) === 0 ? 'granted' : 'denied';
  const securityConfig = (defaultBlocked & securityStorageCategory) === 0 ? 'granted' : 'denied';

  gcm.hasInitialized = true;
  gcm.useNativeChannel = useNativeChannel;
  gcm.url_passthrough = urlPassthrough;
  gcm.ads_data_redaction = adConfig === 'denied' && redactData;
  gcm.storage.ad_storage = adConfig;
  gcm.storage.ad_user_data = adConfig;
  gcm.storage.ad_personalization = adConfig;
  gcm.storage.analytics_storage = analyticsConfig;
  gcm.storage.functionality_storage = functionalityConfig;
  gcm.storage.personalization_storage = personalizationConfig;
  gcm.storage.security_storage = securityConfig;

  gcm.data_layer_property = dataLayerProperty || 'dataLayer';
  gcm.ads_data_redaction && gtag('set', 'ads_data_redaction', gcm.ads_data_redaction);

  gcm.url_passthrough && gtag('set', 'url_passthrough', gcm.url_passthrough);

  if (gcm.useNativeChannel) {
    window[dataLayerProperty].push = function (...args) {
      if (args && args[0]) {
        const cmd = args[0][0];
        const mod = args[0][1];
        const typ = args[0][2];

        const isNative =
          typ &&
          typeof typ === 'object' &&
          Object.values(typ).length === 4 &&
          typ.ad_storage &&
          typ.analytics_storage &&
          typ.ad_user_data &&
          typ.ad_personalization;

        if (cmd === 'consent' && isNative) {
          if (mod === 'default') {
            typ.functionality_storage = gcm.storage.functionality_storage;
            typ.personalization_storage = gcm.storage.personalization_storage;
            typ.security_storage = 'granted';
            if (gcm.storage.wait_for_update) {
              typ.wait_for_update = gcm.storage.wait_for_update;
            }
          } else if (mod === 'update') {
            try {
              const val = window.Shopify.customerPrivacy.preferencesProcessingAllowed() ? 'granted' : 'denied';
              typ.functionality_storage = val;
              typ.personalization_storage = val;
            } catch (e) {
              // do not do anything
            }
            typ.security_storage = 'granted';
          }
        }
      }

      return Array.prototype.push.apply(this, args);
    };
  }

  runConsent();
}

function runConsent() {
  // own logic
  if (useNativeChannel === false) {
    console.log(`Pandectes: Google Consent Mode (av2)`);
  } else {
    console.log(`Pandectes: Google Consent Mode (av2nc)`);
  }

  const wait =
    actualPreferences !== defaultBlocked
      ? { wait_for_update: waitForUpdate || 500 }
      : waitForUpdate
        ? { wait_for_update: waitForUpdate }
        : {};

  if (globalVisibility && !hybridStrict) {
    gtag('consent', 'default', { ...gcm.storage, ...wait });
  } else {
    gtag('consent', 'default', {
      ...gcm.storage,
      ...wait,
      region: [
        ...(euOnly || hybridStrict ? EU_COUNTRY_CODES : []),
        ...(caOnly && !hybridStrict ? ['US-CA', 'US-VA', 'US-CT', 'US-UT', 'US-CO'] : []),
        ...(brOnly && !hybridStrict ? ['BR'] : []),
        ...(jpOnly && !hybridStrict ? ['JP'] : []),
        ...(canadaOnly && !hybridStrict ? ['CA'] : []),
        ...(thOnly && !hybridStrict ? ['TH'] : []),
        ...(chOnly && !hybridStrict ? ['CH'] : []),
        ...(zaOnly && !hybridStrict ? ['ZA'] : []),
      ],
    });
    gtag('consent', 'default', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
      functionality_storage: 'granted',
      personalization_storage: 'granted',
      security_storage: 'granted',
    });
  }

  if (defaultBlocked !== actualPreferences) {
    const adConfig = (actualPreferences & adStorageCategory) === 0 ? 'granted' : 'denied';
    const analyticsConfig = (actualPreferences & analyticsStorageCategory) === 0 ? 'granted' : 'denied';
    const functionalityConfig = (actualPreferences & functionalityStorageCategory) === 0 ? 'granted' : 'denied';
    const personalizationConfig = (actualPreferences & personalizationStorageCategory) === 0 ? 'granted' : 'denied';
    const securityConfig = (actualPreferences & securityStorageCategory) === 0 ? 'granted' : 'denied';
    gcm.storage.ad_storage = adConfig;
    gcm.storage.ad_user_data = adConfig;
    gcm.storage.ad_personalization = adConfig;
    gcm.storage.analytics_storage = analyticsConfig;
    gcm.storage.functionality_storage = functionalityConfig;
    gcm.storage.personalization_storage = personalizationConfig;
    gcm.storage.security_storage = securityConfig;
    gtag('consent', 'update', gcm.storage);
  }

  if (id.length || analyticsId.length || adwordsId.length) {
    window[gcm.data_layer_property].push({
      'pandectes.start': new Date().getTime(),
      event: 'pandectes-rules.min.js',
    });
    if (analyticsId.length || adwordsId.length) {
      gtag('js', new Date());
    }
  }

  // inject if needed
  const google = 'https://www.googletagmanager.com';
  if (id.length) {
    const gtmIds = id.split(',');
    window[gcm.data_layer_property].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    for (let i = 0; i < gtmIds.length; i++) {
      const dl = gcm.data_layer_property !== 'dataLayer' ? `&l=${gcm.data_layer_property}` : ``;
      createScript(`${google}/gtm.js?id=${gtmIds[i].trim()}${dl}`);
    }
  }
  if (analyticsId.length) {
    const analyticsIds = analyticsId.split(',');
    for (let i = 0; i < analyticsIds.length; i++) {
      const id = analyticsIds[i].trim();
      if (id.length) {
        createScript(`${google}/gtag/js?id=${id}`);
        gtag('config', id, { send_page_view: false });
      }
    }
  }
  if (adwordsId.length) {
    const adwordsIds = adwordsId.split(',');
    for (let i = 0; i < adwordsIds.length; i++) {
      const id = adwordsIds[i].trim();
      if (id.length) {
        createScript(`${google}/gtag/js?id=${id}`);
        gtag('config', id, { allow_enhanced_conversions: true });
      }
    }
  }
}

if (isBannerActive && customEvent) {
  pushCustomEvent(actualPreferences);
}

export default gcm;
