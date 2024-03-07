import { globalSettings } from './settings';

const {
  blocker: {
    klaviyoIsActive,
    googleConsentMode: { adStorageCategory },
  },
} = globalSettings;

if (klaviyoIsActive) {
  window.addEventListener('PandectesEvent_OnConsent', function (event) {
    const { preferences } = event.detail;
    if (preferences !== null && preferences !== undefined) {
      const setTo = (preferences & adStorageCategory) === 0 ? 'granted' : 'denied';
      if (typeof window.klaviyo !== 'undefined' && window.klaviyo.isIdentified()) {
        window.klaviyo.push([
          'identify',
          {
            ad_personalization: setTo,
            ad_user_data: setTo,
          },
        ]);
      }
    }
  });
}
