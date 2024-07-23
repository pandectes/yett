/*
 * For microsoft integration. Runs on the pandectes-rules script, and is responsible
 * for the injection of UETs and the pushing of events to the datalayer.
 */
import { actualPreferences, storedPreferences } from './config';
import { globalSettings } from './settings';
// import { createScript } from './helpers';
import { EU_COUNTRY_CODES } from './counties';

// Get store settings from the globalSettings object and assign fallback values.
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
    googleConsentMode: { adStorageCategory },
    microsoft: { isActive: isMicrosoftActive, uetTags: uet, dataLayerProperty = 'uetq' },
  },
} = globalSettings;

const mcm = {
  hasInitialized: false,
  data_layer_property: 'uetq',
  storage: {
    ad_storage: 'granted',
  },
};

// initialize the uetq (Microsoft's datalayer)
window[dataLayerProperty] = window[dataLayerProperty] || [];

// uet function (Used for pushing arguments to the datalayer)
function setUet() {
  window[dataLayerProperty].push(arguments);
}

// If integration enabled, calculate ad_storage based on strict or loose policy and send a consent default
if (isBannerActive && isMicrosoftActive) {
  console.log(defaultBlocked);
  console.log(adStorageCategory);
  const adConfig = (defaultBlocked & adStorageCategory) === 0 ? 'granted' : 'denied';

  mcm.hasInitialized = true;
  mcm.storage.ad_storage = adConfig;

  if (globalVisibility && !hybridStrict) {
    setUet('consent', 'default', { ...mcm.storage });
  } else {
    setUet('consent', 'default', {
      ...mcm.storage,
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
    setUet('consent', 'default', {
      ad_storage: 'granted',
    });
  }

  if (storedPreferences !== null) {
    const adConfig = (actualPreferences & adStorageCategory) === 0 ? 'granted' : 'denied';
    mcm.storage.ad_storage = adConfig;

    setUet('consent', 'update', { ...mcm.storage });
  }

  // injects uet tags to the theme.liquid
  if (uet.length) {
    const uetTags = uet.split(',');

    for (let i = 0; i < uetTags.length; i++) {
      injectScript(uetTags[i]);
    }
  }
}

function injectScript(tag) {
  const script = document.createElement('script');
  script.type = 'javascript/blocked';
  script.cookieCategory = 'targeting';

  // Inject your desired JavaScript code or URL
  script.innerHTML = `(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[] ,f=function(){var o={ti: ${tag}, enableAutoSpaTracking: true}; o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")} ,n=d.createElement(t),n.src=r,n.async=1,n.onload=n .onreadystatechange=function() {var s=this.readyState;s &&s!=="loaded"&& s!=="complete"||(f(),n.onload=n. onreadystatechange=null)},i= d.getElementsByTagName(t)[0],i. parentNode.insertBefore(n,i)})(window,document,"script"," //bat.bing.com/bat.js","Tracker");`;
  // Append the script to the body or head
  document.head.appendChild(script);
}
