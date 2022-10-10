export const TYPE_ATTRIBUTE = "javascript/blocked";
export const SCANNER_AGENT = 'Pandectes';

export const IS_SCANNER = window.navigator.userAgent === SCANNER_AGENT;

export const patterns = {
  blacklist: window.PandectesRules.blacklist,
  whitelist: window.PandectesRules.whitelist,
  iframesBlacklist: window.PandectesRules.iframesBlacklist,
  iframesWhitelist: window.PandectesRules.iframesWhitelist
};

// Backup list containing the original blacklisted script elements
export const backupScripts = {
  blacklisted: [],
};

export const backupIFrames = {
  blacklisted: []
}

export const clog = (msg, fn = 'log') => {
  console[fn](`PandectesAutoBlocker: ${msg}`)
}
