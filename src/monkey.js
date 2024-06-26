import { TYPE_ATTRIBUTE } from './constants';
import { shouldBlockScript } from './checks';

const createElementBackup = document.createElement;

const originalDescriptors = {
  src: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'),
  type: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'type'),
};

// Monkey patch the createElement method to prevent dynamic scripts from executing
export default function (...args) {
  // If this is not a script tag, bypass
  const a0 = args[0].toLowerCase();
  if (a0 !== 'script') {
    if (createElementBackup.bind) {
      return createElementBackup.bind(document)(...args);
    } else {
      return createElementBackup;
    }
  }

  const scriptElt = createElementBackup.bind(document)(...args);

  // Define getters / setters to ensure that the script type is properly set
  try {
    Object.defineProperties(scriptElt, {
      src: {
        ...originalDescriptors.src,
        set(value) {
          if (shouldBlockScript(value, scriptElt.type)) {
            originalDescriptors.type.set.call(this, TYPE_ATTRIBUTE);
          }
          originalDescriptors.src.set.call(this, value);
        },
      },
      type: {
        ...originalDescriptors.type,
        get() {
          const typeValue = originalDescriptors.type.get.call(this);
          if (typeValue === TYPE_ATTRIBUTE || shouldBlockScript(this.src, typeValue)) {
            // Prevent script execution.
            return null;
          }
          return typeValue;
        },
        set(value) {
          const typeValue = shouldBlockScript(scriptElt.src, scriptElt.type) ? TYPE_ATTRIBUTE : value;
          originalDescriptors.type.set.call(this, typeValue);
        },
      },
    });

    // Monkey patch the setAttribute function so that the setter is called instead
    scriptElt.setAttribute = function (name, value) {
      if (name === 'type') {
        const typeValue = shouldBlockScript(scriptElt.src, scriptElt.type) ? TYPE_ATTRIBUTE : value;
        originalDescriptors.type.set.call(scriptElt, typeValue);
      } else if (name === 'src') {
        // scriptElt[name] = value
        if (shouldBlockScript(value, scriptElt.type)) {
          originalDescriptors.type.set.call(scriptElt, TYPE_ATTRIBUTE);
        }
        originalDescriptors.src.set.call(scriptElt, value);
      } else {
        HTMLScriptElement.prototype.setAttribute.call(scriptElt, name, value);
      }
    };
  } catch (error) {
    // Monkey patch the setAttribute function so that the setter is called instead
    // eslint-disable-next-line
    console.warn(
      'Yett: unable to prevent script execution for script src ',
      scriptElt.src,
      '.\n',
      'A likely cause would be because you are using a third-party browser extension that monkey patches the "document.createElement" function.',
    );
  }
  return scriptElt;
}
