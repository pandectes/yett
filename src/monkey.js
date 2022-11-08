import { TYPE_ATTRIBUTE, SCANNER_AGENT } from './variables'
import { isOnBlacklist } from './checks'

const createElementBackup = document.createElement

const originalDescriptors = {
  src: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src'),
  type: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'type')
}

if (navigator.userAgent !== SCANNER_AGENT)
  // Monkey patch the createElement method to prevent dynamic scripts from executing
  document.createElement = function(...args) {
    // If this is not a script tag, bypass
    if (args[0].toLowerCase() !== 'script')
      return createElementBackup.bind(document)(...args)

    const scriptElt = createElementBackup.bind(document)(...args)

    // Define getters / setters to ensure that the script type is properly set
    try {
      Object.defineProperties(scriptElt, {
        'src': {
          ...originalDescriptors.src,
          set(value) {
            if (isOnBlacklist(value, scriptElt.type)) {
              originalDescriptors.type.set.call(this, TYPE_ATTRIBUTE)
            }
            originalDescriptors.src.set.call(this, value)
          },
          configurable: true
        },
        'type': {
          ...originalDescriptors.type,
          get() {
            const typeValue = originalDescriptors.type.get.call(this);
            if (typeValue === TYPE_ATTRIBUTE || isOnBlacklist(this.src, typeValue)) {
              // Prevent script execution.
              return null
            }
            return typeValue
          },
          set(value) {
            const typeValue = isOnBlacklist(scriptElt.src, scriptElt.type) ? TYPE_ATTRIBUTE : value
            originalDescriptors.type.set.call(this, typeValue)
          },
          configurable: true
        }
      })

      // Monkey patch the setAttribute function so that the setter is called instead
      scriptElt.setAttribute = function(name, value) {
        if (name === 'type') {
          const typeValue = isOnBlacklist(scriptElt.src, scriptElt.type) ? TYPE_ATTRIBUTE : value
          originalDescriptors.type.set.call(scriptElt, typeValue)
        } else if (name === 'src') {
          // scriptElt[name] = value
          if (isOnBlacklist(value, scriptElt.type)) {
            originalDescriptors.type.set.call(scriptElt, TYPE_ATTRIBUTE)
          }
          originalDescriptors.src.set.call(scriptElt, value)
        } else {
          HTMLScriptElement.prototype.setAttribute.call(scriptElt, name, value)
        }
      }
    } catch (error) {
      // eslint-disable-next-line
      console.warn(
        'Yett: unable to prevent script execution for script src ', scriptElt.src, '.\n',
        'A likely cause would be because you are using a third-party browser extension that monkey patches the "document.createElement" function.'
      )
    }
    return scriptElt
  }
