import { TYPE_ATTRIBUTE } from './constants';
import { blacklisted } from './config';
import { shouldBlockScript, shouldBlockIFrame, shouldBlockBeacon } from './checks';

export const cssOnlyObserver = new MutationObserver((mutations) => {
  for (let i = 0; i < mutations.length; i++) {
    const { addedNodes } = mutations[i];
    for (let i = 0; i < addedNodes.length; i++) {
      const node = addedNodes[i];
      const cookieCategory = node.dataset && node.dataset.cookiecategory;
      if (node.nodeType === 1 && node.tagName === 'LINK') {
        const href = node.dataset && node.dataset.href;
        if (href && cookieCategory) {
          switch (cookieCategory) {
            case 'functionality':
            case 'C0001':
              blacklisted.css[1].push(href);
              break;
            case 'performance':
            case 'C0002':
              blacklisted.css[2].push(href);
              break;
            case 'targeting':
            case 'C0003':
              blacklisted.css[4].push(href);
              break;
          }
        }
      }
    }
  }
});

// Setup a mutation observer to track DOM insertion
export default new MutationObserver((mutations) => {
  for (let i = 0; i < mutations.length; i++) {
    const { addedNodes } = mutations[i];
    for (let i = 0; i < addedNodes.length; i++) {
      const node = addedNodes[i];

      const src = node.src || (node.dataset && node.dataset.src);
      const cookieCategory = node.dataset && node.dataset.cookiecategory;

      if (node.nodeType === 1 && node.tagName === 'IFRAME') {
        if (src) {
          let block = false;
          if (shouldBlockIFrame(src, 1) || cookieCategory === 'functionality' || cookieCategory === 'C0001') {
            block = true;
            blacklisted.iframes[1].push(src);
          } else if (shouldBlockIFrame(src, 2) || cookieCategory === 'performance' || cookieCategory === 'C0002') {
            block = true;
            blacklisted.iframes[2].push(src);
          } else if (shouldBlockIFrame(src, 4) || cookieCategory === 'targeting' || cookieCategory === 'C0003') {
            block = true;
            blacklisted.iframes[4].push(src);
          }
          if (block) {
            node.removeAttribute('src');
            node.setAttribute('data-src', src);
          }
        }
      } else if (node.nodeType === 1 && node.tagName === 'IMG') {
        if (src) {
          let block = false;
          if (shouldBlockBeacon(src, 1)) {
            block = true;
            blacklisted.beacons[1].push(src);
          } else if (shouldBlockBeacon(src, 2)) {
            block = true;
            blacklisted.beacons[2].push(src);
          } else if (shouldBlockBeacon(src, 4)) {
            block = true;
            blacklisted.beacons[4].push(src);
          }
          if (block) {
            node.removeAttribute('src');
            node.setAttribute('data-src', src);
          }
        }
      } else if (node.nodeType === 1 && node.tagName === 'LINK') {
        const href = node.dataset && node.dataset.href;
        if (href && cookieCategory) {
          switch (cookieCategory) {
            case 'functionality':
            case 'C0001':
              blacklisted.css[1].push(href);
              break;
            case 'performance':
            case 'C0002':
              blacklisted.css[2].push(href);
              break;
            case 'targeting':
            case 'C0003':
              blacklisted.css[4].push(href);
              break;
          }
        }
      } else if (node.nodeType === 1 && node.tagName === 'SCRIPT') {
        const type = node.type;
        let block = false;

        if (shouldBlockScript(src, type)) {
          block = true;
        } else if (src && cookieCategory) {
          switch (cookieCategory) {
            case 'functionality':
            case 'C0001':
              block = true;
              window.PandectesRules.manualBlacklist[1].push(src);
              break;
            case 'performance':
            case 'C0002':
              block = true;
              window.PandectesRules.manualBlacklist[2].push(src);
              break;
            case 'targeting':
            case 'C0003':
              block = true;
              window.PandectesRules.manualBlacklist[4].push(src);
              break;
          }
        }

        if (block) {
          // We backup the node
          blacklisted.scripts.push([node, type]);

          // Blocks inline script execution in Safari & Chrome
          node.type = TYPE_ATTRIBUTE;

          // Firefox has this additional event which prevents scripts from beeing executed
          const beforeScriptExecuteListener = function(event) {
            // Prevent only marked scripts from executing
            if (node.getAttribute('type') === TYPE_ATTRIBUTE) event.preventDefault();
            node.removeEventListener('beforescriptexecute', beforeScriptExecuteListener);
          };
          node.addEventListener('beforescriptexecute', beforeScriptExecuteListener);

          // Remove the node from the DOM
          node.parentElement && node.parentElement.removeChild(node);
        }
      }
    }
  }
});
