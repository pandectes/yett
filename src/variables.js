export const TYPE_ATTRIBUTE = "javascript/blocked";
export const SCANNER_AGENT = 'Pandectes';

export const patterns = {
  blacklist: window.PandectesRules.blacklist,
  whitelist: window.PandectesRules.whitelist,
  iframesBlacklist: window.PandectesRules.iframesBlacklist,
  iframesWhitelist: window.PandectesRules.iframesWhitelist
};

console.log(patterns);

// Backup list containing the original blacklisted script elements
export const backupScripts = {
  blacklisted: [],
};

export const backupIFrames = {
  blacklisted: []
}
