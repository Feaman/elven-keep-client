import BaseService from "./base"

export default class KeyboardEvents extends BaseService {
  static ENTER = 'ENTER'
  static SPACE = 'SPACE'
  static ESCAPE = 'ESCAPE'
  static DELETE = 'DELETE'
  static BACKSPACE = 'BACKSPACE'
  static ARROW_UP = 'ARROW_UP'
  static ARROW_DOWN = 'ARROW_DOWN'
  static ARROW_LEFT = 'ARROW_LEFT'
  static ARROW_RIGHT = 'ARROW_RIGHT'
  static Z = 'Z'

  static keyboardEvents = {
    [KeyboardEvents.Z]: {
      keyCode: 90,
      keys: ['z']
    },
    [KeyboardEvents.ENTER]: {
      keyCode: 13,
      keys: ['Enter']
    },
    [KeyboardEvents.SPACE]: {
      keyCode: 32,
      keys: ['Space']
    },
    [KeyboardEvents.ESCAPE]: {
      keyCode: 27,
      keys: ['Esc', 'Escape']
    },
    [KeyboardEvents.BACKSPACE]: {
      keyCode: 8,
      keys: ['Backspace']
    },
    [KeyboardEvents.DELETE]: {
      keyCode: 46,
      keys: ['Delete']
    },
    [KeyboardEvents.ARROW_UP]: {
      keyCode: 38,
      keys: ['ArrowUp']
    },
    [KeyboardEvents.ARROW_DOWN]: {
      keyCode: 40,
      keys: ['ArrowDown']
    },
    [KeyboardEvents.ARROW_LEFT]: {
      keyCode: 37,
      keys: ['ArrowLeft']
    },
    [KeyboardEvents.ARROW_RIGHT]: {
      keyCode: 39,
      keys: ['ArrowRight']
    }
  }

  static is (event: KeyboardEvent, keyNames: string | string[], shiftKey = false, controlKey = false, metaKey = false) {
    if (!Array.isArray(keyNames)) {
      keyNames = [keyNames]
    }

    let match = false
    keyNames.forEach(keyName => {
      if (
        ((!metaKey && !event.metaKey) || (metaKey && event.metaKey)) &&
        ((!controlKey && !event.ctrlKey) || (controlKey && event.ctrlKey)) &&
        ((!shiftKey && !event.shiftKey) || (shiftKey && event.shiftKey)) &&
        this.keyboardEvents[keyName] &&
        (
          (event.key && this.keyboardEvents[keyName].keys.includes(event.key)) ||
          this.keyboardEvents[keyName].keyCode === event.keyCode
        )
      ) {
        match = true
      }
    })

    return match
  }
}
