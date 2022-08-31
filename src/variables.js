import { clog, getCookie } from './helpers';

window.PandectesRules = window.PandectesRules || {};
window.PandectesRules.manualBlacklist = { 1: [], 2: [], 4: [] };
window.PandectesRules.blacklistedIFrames = { 1: [], 2: [], 4: [] };
window.PandectesRules.blacklistedCss = { 1: [], 2: [], 4: [] };
window.PandectesRules.blacklistedBeacons = { 1: [], 2: [], 4: [] };

// Backup list containing the original blacklisted script elements
export const backupScripts = {
  blacklisted: [],
};

const cookieValue = getCookie();

const { blackList, whiteList, iframesBlackList, iframesWhiteList, beaconsBlackList, beaconsWhiteList } =
  window.PandectesSettings.blocker.patterns;

const patterns = {
  blackList: [],
  whiteList: [],
  iframesBlackList: {
    1: [],
    2: [],
    4: [],
    8: [],
  },
  iframesWhiteList: [],
  beaconsBlackList: {
    1: [],
    2: [],
    4: [],
    8: [],
  },
  beaconsWhiteList: [],
};

const preferences = cookieValue
  ? cookieValue.preferences !== null && cookieValue.preferences !== undefined
    ? cookieValue.preferences
    : 7
  : 7;

clog('Initial preferences: ' + preferences);

const p = [];
p[1] = (preferences & 1) === 0;
p[2] = (preferences & 2) === 0;
p[4] = (preferences & 4) === 0;

const mrx = (s) => new RegExp(s);

[1, 2, 4].map((cat) => {
  if (!p[cat]) {
    patterns.blackList.push(...(blackList[cat].length ? blackList[cat].map(mrx) : []));
    patterns.iframesBlackList[cat] = iframesBlackList[cat].length ? iframesBlackList[cat].map(mrx) : [];
    patterns.beaconsBlackList[cat] = beaconsBlackList[cat].length ? beaconsBlackList[cat].map(mrx) : [];
  }
});
patterns.whiteList = whiteList.length ? whiteList.map(mrx) : [];
patterns.iframesWhiteList = iframesWhiteList.length ? iframesWhiteList.map(mrx) : [];
patterns.beaconsWhiteList = beaconsWhiteList.length ? beaconsWhiteList.map(mrx) : [];

// window.PandectesRules.blacklist = patterns.blackList;
// window.PandectesRules.patterns = patterns;

export { patterns, preferences };
