export const TYPE_ATTRIBUTE = "javascript/blocked";
export const SCANNER_AGENT = 'Pandectes';

export const patterns = {
  blacklist: window.PandectesRules.blacklist,
  whitelist: window.PandectesRules.whitelist,
};

// Backup list containing the original blacklisted script elements
export const backupScripts = {
  blacklisted: [],
};
