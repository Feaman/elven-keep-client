import StorageService from './storage'
import BaseService from '~/services/base'
import ApiService, { ConfigObject } from '~/services/api'

export default class UserService extends BaseService {
  static AUTH_TOKEN_NAME= 'auth-token'

  static login (email: string, password: string) {
    return ApiService.login(email, password)
      .then(data => this.auth(data))
  }

  static logout () {
    StorageService.set({ [this.AUTH_TOKEN_NAME]: null })
    this.router?.push('/login')
  }

  static register (email: string, password: string, firstName: string, secondName: string) {
    return ApiService.register(email, password, firstName, secondName)
      .then(data => this.auth(data))
  }

  static auth (data: ConfigObject) {
    StorageService.set({ [this.AUTH_TOKEN_NAME]: data.token })
    return BaseService.handleInitData(data)
  }
}
