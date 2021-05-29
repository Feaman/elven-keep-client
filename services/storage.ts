export default class StorageService {
  static set (data: any) {
    // Merge data with existing one
    const existingData = this.get()
    data = Object.assign(existingData, data)

    window.localStorage.setItem('__ELVEN-NOTES__', JSON.stringify(data))
  }

  static get (key: string = '') {
    const data = JSON.parse(window.localStorage.getItem('__ELVEN-NOTES__') || '{}')
    return key ? data[key] : data
  }
}
