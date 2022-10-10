import { backupScripts } from './variables';
import "./observer";
import "./monkey";
import { unblock } from "./unblock";
window.PandectesRules = window.PandectesRules || {};

window.PandectesRules.manualBlacklist = {
  1: [],
  2: [],
  4: []
};

window.PandectesRules.unblock = unblock;

window.PandectesRules.getBackupScripts = function() {
  const output = [];
  for (let i = 0; i < backupScripts.blacklisted.length; i += 1) {
    output.push(backupScripts.blacklisted[i][0].getAttribute('src'));
  }
  return output;
}

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
