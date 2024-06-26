// import { SCANNER_AGENT } from './constants';
import { getCookie, fixRegExp } from './helpers';
import { checkIsScanner } from './scanner';
import { globalSettings } from './settings';

export const isScanner = checkIsScanner();

export const cookieValue = getCookie();
export const {
  banner: { isActive: bannerIsActive },
  blocker: { defaultBlocked, patterns: globalPatterns },
} = globalSettings;

// these are the initial preferences
export const storedPreferences = cookieValue
  ? cookieValue.preferences !== null && cookieValue.preferences !== undefined
    ? cookieValue.preferences
    : null
  : null;

export const actualPreferences = isScanner
  ? 0
  : bannerIsActive
  ? storedPreferences === null
    ? defaultBlocked
    : storedPreferences
  : 0;

// this is the setup of the categories based on the initial preferences
export const categoryAllowed = {
  1: (actualPreferences & 1) === 0,
  2: (actualPreferences & 2) === 0,
  4: (actualPreferences & 4) === 0,
};

// calculate the patterns
const { blackList, whiteList, iframesBlackList, iframesWhiteList, beaconsBlackList, beaconsWhiteList } = globalPatterns;
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

[1, 2, 4].map((cat) => {
  if (!categoryAllowed[cat]) {
    patterns.blackList.push(...(blackList[cat].length ? blackList[cat].map(fixRegExp) : []));
    patterns.iframesBlackList[cat] = iframesBlackList[cat].length ? iframesBlackList[cat].map(fixRegExp) : [];
    patterns.beaconsBlackList[cat] = beaconsBlackList[cat].length ? beaconsBlackList[cat].map(fixRegExp) : [];
  }
});
patterns.whiteList = whiteList.length ? whiteList.map(fixRegExp) : [];
patterns.iframesWhiteList = iframesWhiteList.length ? iframesWhiteList.map(fixRegExp) : [];
patterns.beaconsWhiteList = beaconsWhiteList.length ? beaconsWhiteList.map(fixRegExp) : [];

const blacklisted = {
  scripts: [],
  iframes: { 1: [], 2: [], 4: [] },
  beacons: { 1: [], 2: [], 4: [] },
  css: { 1: [], 2: [], 4: [] },
};

export { patterns, blacklisted };
