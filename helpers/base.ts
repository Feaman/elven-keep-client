export default class BaseHelper {
  static debounce (functionObject: Function, milliseconds: number) {
    let isCoolDown = false

    return function () {
      if (isCoolDown) { return }
      // @ts-ignore
      functionObject.apply(this, arguments)

      isCoolDown = true

      setTimeout(() => isCoolDown = false, milliseconds)
    }
  }
}
