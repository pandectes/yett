import { backupScripts, TYPE_ATTRIBUTE, SCANNER_AGENT } from './variables'
import { isOnBlacklist } from './checks'

function fixRegExp(rule) {
  return new RegExp(rule.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
}

// Setup a mutation observer to track DOM insertion
export const observer = new MutationObserver(mutations => {
  for (let i = 0; i < mutations.length; i++) {
    const { addedNodes } = mutations[i];
    for (let i = 0; i < addedNodes.length; i++) {
      const node = addedNodes[i]
      // For each added script tag
      if (node.nodeType === 1 && node.tagName === 'SCRIPT') {
        const src = node.src
        const type = node.type
        const cookieCategory = node.dataset.cookiecategory || '';

        // If the src is inside the blacklist and is not inside the whitelist
        if (isOnBlacklist(src, type)) {
          // We backup the node
          backupScripts.blacklisted.push([node, node.type])

          // Blocks inline script execution in Safari & Chrome
          node.type = TYPE_ATTRIBUTE

          // Firefox has this additional event which prevents scripts from beeing executed
          const beforeScriptExecuteListener = function(event) {
            // Prevent only marked scripts from executing
            if (node.getAttribute('type') === TYPE_ATTRIBUTE)
              event.preventDefault()
            node.removeEventListener('beforescriptexecute', beforeScriptExecuteListener)
          }
          node.addEventListener('beforescriptexecute', beforeScriptExecuteListener)

          // Remove the node from the DOM
          node.parentElement && node.parentElement.removeChild(node)
        }

        if (cookieCategory && node.src) {
          let block = true;
          switch (cookieCategory) {
            case 'functionality':
            case 'C0001':
              window.PandectesRules.manualBlacklist[1].push(node.src);
              break;
            case 'performance':
            case 'C0002':
              window.PandectesRules.manualBlacklist[2].push(node.src);
              break;
            case 'targeting':
            case 'C0003':
              window.PandectesRules.manualBlacklist[4].push(node.src);
              break;
            default:
              block = false;
          }

          if (block) {
            // We backup the node
            backupScripts.blacklisted.push([node, null]);
            window.PandectesRules.blacklist.push(fixRegExp(node.src));
            // Remove the node from the DOM
            node.parentElement && node.parentElement.removeChild(node)
          }
        }
      }
    }
  }
})

if (navigator.userAgent !== SCANNER_AGENT) {
  // Starts the monitoring
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  })
} else {
  const intervalId = setInterval(() => {
    if (window.Shopify) {
      clearInterval(intervalId);
      window.Shopify.loadFeatures(
        [
          {
            name: 'consent-tracking-api',
            version: '0.1',
          },
        ],
        (error) => {
          if (error) {
            return;
          }
          if (window.Shopify.trackingConsent) {
            window.Shopify.trackingConsent.setTrackingConsent(true, function(response) {
              if (response && response.error) {
                return;
              }
            });
          }
        },
      );
    }
  }, 20);
}

