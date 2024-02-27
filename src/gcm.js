import { clog } from './helpers';
import { actualPreferences, categoryAllowed } from './config';
import { globalSettings } from './settings';

const {
  banner: { isActive: isBannerActive },
  blocker: {
    googleConsentMode: {
      isActive: isGcmActive,
      customEvent,
      id,
      analyticsId,
      redactData,
      urlPassthrough,
      adStorageCategory,
      analyticsStorageCategory,
      functionalityStorageCategory,
      personalizationStorageCategory,
      securityStorageCategory,
      dataLayerProperty = 'dataLayer',
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
  gcm.storage.ad_user_data = adConfig;
  gcm.storage.ad_personalization = adConfig;
  gcm.storage.analytics_storage = analyticsConfig;
  gcm.storage.functionality_storage = functionalityConfig;
  gcm.storage.personalization_storage = personalizationConfig;
  gcm.storage.security_storage = securityConfig;
  gcm.data_layer_property = dataLayerProperty || 'dataLayer';

  gcm.ads_data_redaction && gtag('set', 'ads_data_redaction', gcm.ads_data_redaction);

  gcm.url_passthrough && gtag('set', 'url_passthrough', gcm.url_passthrough);

  gtag('consent', 'default', gcm.storage);
  clog('Google consent mode initialized');

  // inject if needed
  if (id.length) {
    window[gcm.data_layer_property].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    window[gcm.data_layer_property].push({ 'pandectes.start': new Date().getTime(), event: 'pandectes-rules.min.js' });
    const script = document.createElement('script');
    const dl = gcm.data_layer_property !== 'dataLayer' ? `&l=${gcm.data_layer_property}` : ``;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${id}${dl}`;
    document.head.appendChild(script);
  }
  if (analyticsId.length) {
    window[gcm.data_layer_property].push({ 'pandectes.start': new Date().getTime(), event: 'pandectes-rules.min.js' });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
    document.head.appendChild(script);
    gtag('js', new Date());
    gtag('config', analyticsId);
  }
}
if (isBannerActive && customEvent) {
  pushCustomEvent(actualPreferences);
  clog('PandectesCustomEvent pushed to the dataLayer');
}

export default gcm;
