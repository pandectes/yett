import { preferences } from "./variables";

window.dataLayer = window.dataLayer || [];
function gtag() {
  window.dataLayer.push(arguments);
}
if (window.PandectesRules.gcmConfig) {
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

  window.PandectesRules.initializeGcm = function (
    gcmConfig,
    defaultBlocked = 0
  ) {
    const cookie = this.getCookie();
    let blocked = defaultBlocked;
    if (
      cookie &&
      cookie.preferences !== null &&
      cookie.preferences !== undefined
    ) {
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
      (+blocked & gcmConfig.securityStorageCategory) === 0
        ? "granted"
        : "denied";

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
  const { gcmConfig: gcm, defaultBlocked } = window.PandectesRules;

  // google consent mode
  if (gcm.isActive) {
    window.PandectesRules.initializeGcm(gcm, defaultBlocked);
    window.PandectesRules.gcm.ads_data_redaction &&
      gtag(
        "set",
        "ads_data_redaction",
        window.PandectesRules.gcm.ads_data_redaction
      );
    window.PandectesRules.gcm.url_passthrough &&
      gtag("set", "url_passthrough", window.PandectesRules.gcm.url_passthrough);
    gtag("consent", "default", window.PandectesRules.gcm.storage);

    // this code runs only on the checkouts page
    if (/\/checkouts\//.test(window.location.pathname)) {
      const p1 = (preferences & 1) === 0;
      const p2 = (preferences & 2) === 0;
      const p4 = (preferences & 4) === 0;
      let status;
      if (preferences === 7) {
        status = "deny";
      } else if (preferences === 0) {
        status = "allow";
      } else {
        status = "mixed";
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "Pandectes_Consent_Update",
        pandectes_status: status,
        pandectes_categories: {
          C000: "allow",
          C001: p1 ? "allow" : "deny",
          C002: p2 ? "allow" : "deny",
          C003: p4 ? "allow" : "deny",
        },
      });
    }
  }
}
