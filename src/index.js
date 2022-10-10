import { backupScripts, IS_SCANNER, clog } from './variables';
import observer from "./observer";
import monkey from './monkey';
import "./monkey";
import { unblock } from "./unblock";

clog(`userAgent -> ${window.navigator.userAgent}`);

const intervalId = setInterval(() => {
  if (window.Shopify) {
    clearInterval(intervalId);
    window.Shopify.loadFeatures([{
      name: 'consent-tracking-api',
      version: '0.1'
    }], error => {
      if (error) {
        clog('consent-tracking-api -> failed to load', 'warning');
        return;
      }
      clog('consent-tracking-api -> loaded successfully')
      if (IS_SCANNER) {
        window.Shopify.customerPrivacy.setTrackingConsent(true, (response) => {
          if (response && response.error) {
            clog('consent-tracking-api -> failed to allow tracking', 'error')
          }
          clog('consent-tracking-api -> tracking allowed');
        })
      }
    });
  }
}, 10);

window.PandectesRules = window.PandectesRules || {};

if (IS_SCANNER === false) {
  clog('patching createElement');
  document.createElement = monkey;
  clog('connecting observer');
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

window.PandectesRules.manualBlacklist = {
  1: [],
  2: [],
  4: []
};

window.PandectesRules.unblock = unblock;
window.PandectesRules.toJson = function(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return false;
  }
};

window.PandectesRules.getBackupScripts = function() {
  const output = [];
  for (let i = 0; i < backupScripts.blacklisted.length; i += 1) {
    output.push(backupScripts.blacklisted[i][0].getAttribute('src'));
  }
  return output;
}

window.PandectesRules.getCookie = function(name = "_pandectes_gdpr") {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  let cookieValue;
  if (parts.length < 2) {
    cookieValue = {};
  } else {
    const popped = parts.pop();
    const splitted = popped.split(";");
    cookieValue = window.atob(splitted.shift());
  }
  const cookieValueParsed = this.toJson(cookieValue);
  if (cookieValueParsed !== false) {
    return cookieValueParsed;
  } else {
    return cookieValue;
  }
};

window.PandectesRules.gcm = {
  hasInitialized: false,
  ads_data_redaction: false,
  url_passthrough: false,
  storage: {
    ad_storage: "granted",
    analytics_storage: "granted",
    functionality_storage: "granted",
    personalization_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  },
};

window.PandectesRules.initializeGcm = function(gcmConfig, defaultBlocked = 0) {
  const cookie = this.getCookie();
  let blocked = defaultBlocked;
  if (cookie && cookie.preferences !== null && cookie.preferences !== undefined) {
    blocked = cookie.preferences;
  }

  const adConfig =
    (+blocked & gcmConfig.adStorageCategory) === 0 ? "granted" : "denied";
  const analyticsConfig =
    (+blocked & gcmConfig.analyticsStorageCategory) === 0
      ? "granted"
      : "denied";
  const functionalityConfig =
    (+blocked & gcmConfig.functionalityStorageCategory) === 0
      ? "granted"
      : "denied";
  const personalizationConfig =
    (+blocked & gcmConfig.personalizationStorageCategory) === 0
      ? "granted"
      : "denied";
  const securityConfig =
    (+blocked & gcmConfig.securityStorageCategory) === 0 ? "granted" : "denied";

  this.gcm = {
    hasInitialized: true,
    ads_data_redaction: adConfig === "denied" && gcmConfig.redactData,
    url_passthrough: gcmConfig.urlPassthrough,
    storage: {
      ad_storage: adConfig,
      analytics_storage: analyticsConfig,
      functionality_storage: functionalityConfig,
      personalization_storage: personalizationConfig,
      security_storage: securityConfig,
      wait_for_update: 500,
    },
  };
};
