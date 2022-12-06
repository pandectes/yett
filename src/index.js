import './bootstrap';
import { clog } from './helpers';
import { isScanner, actualPreferences } from './config';
import scriptsObserver, { cssOnlyObserver } from './observer';
import monkey from './monkey';
import './monkey';
import './unblock';
import './shopify';
import './gcm';
import gcm from './gcm';

window.PandectesRules.gcm = gcm;

const {
  banner: { isActive: isBannerActive },
  blocker: { isActive: isBlockerActive },
} = window.PandectesSettings;

clog('Blocker -> ' + (isBlockerActive ? 'Active' : 'Inactive'));
clog('Banner -> ' + (isBannerActive ? 'Active' : 'Inactive'));
clog('ActualPrefs -> ' + actualPreferences);

if (actualPreferences !== 0 && isScanner === false && isBlockerActive) {
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
} else {
  clog('Blocker will not execute');
}
