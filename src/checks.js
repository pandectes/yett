import { patterns, TYPE_ATTRIBUTE } from './variables'

export const isOnBlacklist = (src, type) => (
  src &&
  (!type || type !== TYPE_ATTRIBUTE) &&
  (
    (!patterns.blacklist || patterns.blacklist.some(pattern => pattern.test(src))) &&
    (!patterns.whitelist || patterns.whitelist.every(pattern => !pattern.test(src)))
  )
)

export const isOnBlacklistIFrame = (src) => (src &&
  (
    (!patterns.iframesBlacklist || patterns.iframesBlacklist.some(pattern => pattern.test(src))) &&
    (!patterns.iframesWhitelist || patterns.iframesWhitelist.every(pattern => !pattern.test(src)))
  )
)

export const willBeUnblocked = function(script) {
  const src = script.getAttribute('src')
  return (
    patterns.blacklist && patterns.blacklist.every(entry => !entry.test(src)) ||
    patterns.whitelist && patterns.whitelist.some(entry => entry.test(src))
  )
}

export const willBeUnblockedIFrame = function(src) {
  return (
    patterns.iframesBlacklist && patterns.iframesBlacklist.every(entry => !entry.test(src)) ||
    patterns.iframesWhitelist && patterns.iframesWhitelist.some(entry => entry.test(src))
  )
}

