import ApiService, { ConfigObject } from '~/services/api/api'
import InitService from '~/services/init'
import StorageService from '~/services/storage'

const AUTH_TOKEN_NAME = 'auth-token'

function auth(data: ConfigObject) {
  StorageService.set({ [AUTH_TOKEN_NAME]: data.token })
  return InitService.initApplication(data)
}

async function signIn(email: string, password: string) {
  const data = await ApiService.signIn(email, password)
  auth(data)
}

async function register(email: string, password: string, firstName: string, secondName: string) {
  const data = await ApiService.signUp(email, password, firstName, secondName)
  auth(data)
}

export default {
  AUTH_TOKEN_NAME,
  auth,
  signIn,
  register,
}
