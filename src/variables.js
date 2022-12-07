export const TYPE_ATTRIBUTE = "javascript/blocked";
export const SCANNER_AGENT = "Pandectes";

window.PandectesRules.toJson = function (value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return false;
  }
};

window.PandectesRules.getCookie = function (name = "_pandectes_gdpr") {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  let cookieValue;
  if (parts.length < 2) {
    cookieValue = {};
  } else {
    const popped = parts.pop();
    const splitted = popped.split(";");
    cookieValue = window.atob(splitted.shift());
  }
  const cookieValueParsed = this.toJson(cookieValue);
  if (cookieValueParsed !== false) {
    return cookieValueParsed;
  } else {
    return cookieValue;
  }
};

const cookieValue = window.PandectesRules.getCookie();

const preferences = cookieValue
  ? cookieValue.preferences !== null && cookieValue.preferences !== undefined
    ? cookieValue.preferences
    : 7
  : 7;

const p1 = (preferences & 1) === 0;
const p2 = (preferences & 2) === 0;
const p4 = (preferences & 4) === 0;

const c1 = p1 ? [] : window.PandectesRules.c1 || [];
const c2 = p2 ? [] : window.PandectesRules.c2 || [];
const c4 = p4 ? [] : window.PandectesRules.c4 || [];

export const patterns = {
  blacklist: [...c1, ...c2, ...c4],
  whitelist: window.PandectesRules.whitelist,
};

window.PandectesRules.blacklist = patterns.blacklist;

export { preferences };

// Backup list containing the original blacklisted script elements
export const backupScripts = {
  blacklisted: [],
};
