import { TYPE_ATTRIBUTE } from './constants';
import { clog } from './helpers';
import { patterns, blacklisted } from './config';
import { willScriptBeUnblocked } from './checks';
import observer, { cssOnlyObserver } from './observer';

const URL_REPLACER_REGEXP = new RegExp('[|\\{}()[\\]^$+*?.]', 'g');

window.PandectesRules.unblockCss = (category) => {
  clog(`Unblocking CSS for ${category}`);
  const bl = blacklisted.css[category] || [];
  bl.forEach((href) => {
    const cssNode = document.querySelector(`link[data-href^="${href}"]`);
    cssNode.removeAttribute('data-href');
    cssNode.href = href;
  });
  blacklisted.css[category] = [];
};

window.PandectesRules.unblockIFrames = (category) => {
  clog(`Unblocking IFrames for ${category}`);
  const bl = blacklisted.iframes[category] || [];
  // this must happen before you call iframeNode.src = ... two lines later
  patterns.iframesBlackList[category] = [];
  bl.forEach((src) => {
    const iframeNode = document.querySelector(`iframe[data-src^="${src}"]`);
    iframeNode.removeAttribute('data-src');
    iframeNode.src = src;
  });
  // empty out blacklisted for this category since we whitelisted them
  blacklisted.iframes[category] = [];
};

window.PandectesRules.unblockBeacons = (category) => {
  clog(`Unblocking Beacons for ${category}`);
  const bl = blacklisted.beacons[category] || [];
  // this must happen before you call iframeNode.src = ... two lines later
  patterns.beaconsBlackList[category] = [];
  bl.forEach((src) => {
    const beaconNode = document.querySelector(`img[data-src^="${src}"]`);
    beaconNode.removeAttribute('data-src');
    beaconNode.src = src;
  });
  // empty out blacklisted for this category since we whitelisted them
  blacklisted.beacons[category] = [];
};

// Unblocks all (or a selection of) blacklisted scripts.
window.PandectesRules.unblock = function (scriptUrlsOrRegexes) {
  if (scriptUrlsOrRegexes.length < 1) {
    patterns.blackList = [];
    patterns.whiteList = [];
    patterns.iframesBlackList = [];
    patterns.iframesWhiteList = [];
  } else {
    if (patterns.blackList) {
      patterns.blackList = patterns.blackList.filter((pattern) => {
        return scriptUrlsOrRegexes.every((urlOrRegexp) => {
          if (typeof urlOrRegexp === 'string') {
            return !pattern.test(urlOrRegexp);
          } else if (urlOrRegexp instanceof RegExp) {
            return pattern.toString() !== urlOrRegexp.toString();
          }
        });
      });
    }
    if (patterns.whiteList) {
      patterns.whiteList = [
        ...patterns.whiteList,
        ...scriptUrlsOrRegexes
          .map((urlOrRegexp) => {
            if (typeof urlOrRegexp === 'string') {
              const escapedUrl = urlOrRegexp.replace(URL_REPLACER_REGEXP, '\\$&');
              const permissiveRegexp = '.*' + escapedUrl + '.*';
              if (patterns.whiteList.every((p) => p.toString() !== permissiveRegexp.toString())) {
                return new RegExp(permissiveRegexp);
              }
            } else if (urlOrRegexp instanceof RegExp) {
              if (patterns.whiteList.every((p) => p.toString() !== urlOrRegexp.toString())) {
                return urlOrRegexp;
              }
            }
            return null;
          })
          .filter(Boolean),
      ];
    }
  }

  // Parse existing script tags with a marked type
  const tags = document.querySelectorAll(`script[type="${TYPE_ATTRIBUTE}"]`);
  for (let i = 0; i < tags.length; i++) {
    const script = tags[i];
    if (willScriptBeUnblocked(script)) {
      blacklisted.scripts.push([script, 'application/javascript']);
      script.parentElement.removeChild(script);
    }
  }

  // Exclude 'whitelisted' scripts from the blacklist and append them to <head>
  let indexOffset = 0;
  [...blacklisted.scripts].forEach(([script, type], index) => {
    if (willScriptBeUnblocked(script)) {
      const scriptNode = document.createElement('script');
      for (let i = 0; i < script.attributes.length; i++) {
        let attribute = script.attributes[i];
        if (attribute.name !== 'src' && attribute.name !== 'type') {
          scriptNode.setAttribute(attribute.name, script.attributes[i].value);
        }
      }
      scriptNode.setAttribute('src', script.src);
      scriptNode.setAttribute('type', type || 'application/javascript');
      document.head.appendChild(scriptNode);
      blacklisted.scripts.splice(index - indexOffset, 1);
      indexOffset++;
    }
  });

  // Disconnect the observer if the blacklist is empty for performance reasons
  if (
    patterns.blackList.length == 0 &&
    patterns.iframesBlackList[1].length === 0 &&
    patterns.iframesBlackList[2].length === 0 &&
    patterns.iframesBlackList[4].length === 0 &&
    patterns.beaconsBlackList[1].length === 0 &&
    patterns.beaconsBlackList[2].length === 0 &&
    patterns.beaconsBlackList[4].length === 0
  ) {
    clog('Disconnecting observers');
    observer.disconnect();
    cssOnlyObserver.disconnect();
  }
};
