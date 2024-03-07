import { globalSettings } from './settings';

const {
  banner: { revokableTrigger },
  // library: { revokableReset },
} = globalSettings;

if (revokableTrigger) {
  window.addEventListener('PandectesEvent_OnInitialize', function () {
    const reopenTrigger = document.querySelectorAll('[href*="#reopenBanner"]');
    reopenTrigger.forEach((el) => {
      el.onclick = function (e) {
        e.preventDefault();
        window.Pandectes.fn.revokeConsent();
      };
    });
  });
}
