import './bootstrap';
import { clog } from './helpers';
import { isScanner, actualPreferences, storedPreferences } from './config';
import scriptsObserver, { cssOnlyObserver } from './observer';
import monkey from './monkey';
import { globalSettings } from './settings';
// import './monkey';
import './unblock';
import './shopify';
import './gcm';
import './klaviyo';
import './reopen';
import gcm from './gcm';

window.PandectesRules.gcm = gcm;

const {
  banner: { isActive: isBannerActive },
  blocker: { isActive: isBlockerActive },
} = globalSettings;

clog(
  `Prefs: ${actualPreferences} | Banner: ${isBannerActive ? 'on' : 'off'} | Blocker: ${isBlockerActive ? 'on' : 'off'}`,
);

const onCheckoutWithoutConsent = storedPreferences === null && /\/checkouts\//.test(window.location.pathname);

if (actualPreferences !== 0 && isScanner === false && isBlockerActive && !onCheckoutWithoutConsent) {
  clog('Blocker will execute');
  document.createElement = monkey;
  scriptsObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  cssOnlyObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
