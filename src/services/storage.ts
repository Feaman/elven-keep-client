import { LocalStorage, WebStorageGetMethodReturnType } from 'quasar'

export default class StorageService {
  private static key = '__ELVEN-NOTES__'

  static set(data: object) {
    // Merge data with existing one
    const existingData = this.get()
    data = Object.assign(existingData, data)

    LocalStorage.set(StorageService.key, data)
  }

  static get(key = '') {
    const data: { [index: string]: WebStorageGetMethodReturnType } = LocalStorage.getItem(StorageService.key) || {}
    return key ? data[key] : data
  }
}
