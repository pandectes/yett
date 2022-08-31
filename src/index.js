import './bootstrap';
import { clog } from './helpers';
import { isScanner, actualPreferences } from './config';
import observer, { cssOnlyObserver } from './observer';
import monkey from './monkey';
import './monkey';
import './unblock';
import './shopify';
import './gcm';
import gcm from './gcm';

window.PandectesRules.gcm = gcm;

window.PandectesRules.manualBlacklist = { 1: [], 2: [], 4: [] };

if (actualPreferences !== 0) {
  if (isScanner === false && window.PandectesSettings.blocker.isActive) {
    clog('Patching createElement');
    document.createElement = monkey;
    clog('Connecting observer');
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
} else {
  cssOnlyObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
