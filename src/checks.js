import { TYPE_ATTRIBUTE } from './constants';
import { patterns } from './config';

export const shouldBlockScript = (src, type) =>
  src &&
  (!type || type !== TYPE_ATTRIBUTE) &&
  (!patterns.blackList || patterns.blackList.some((pattern) => pattern.test(src))) &&
  (!patterns.whiteList || patterns.whiteList.every((pattern) => !pattern.test(src)));

export const willScriptBeUnblocked = function (script) {
  const src = script.getAttribute('src');
  return (
    (patterns.blackList && patterns.blackList.every((entry) => !entry.test(src))) ||
    (patterns.whiteList && patterns.whiteList.some((entry) => entry.test(src)))
  );
};

export const shouldBlockIFrame = (src, cat) => {
  const bl = patterns.iframesBlackList[cat];
  const wl = patterns.iframesWhiteList;
  return src && (!bl || bl.some((p) => p.test(src))) && (!wl || wl.every((p) => !p.test(src)));
};

export const shouldBlockBeacon = (src, cat) => {
  const bl = patterns.beaconsBlackList[cat];
  const wl = patterns.beaconsWhiteList;
  return src && (!bl || bl.some((p) => p.test(src))) && (!wl || wl.every((p) => !p.test(src)));
};
