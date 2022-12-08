import { useRouter } from 'vue-router'
import { ConfigObject } from '~/services/api/api'
import BaseService from '~/services/base'
import InitService from '~/services/init'
import StorageService from '~/services/storage'

const AUTH_TOKEN_NAME = 'auth-token'
const router = useRouter()

function auth(data: ConfigObject) {
  StorageService.set({ [AUTH_TOKEN_NAME]: data.token })
  return InitService.initApplication(data)
}

async function login(email: string, password: string) {
  const data = await BaseService.api.login(email, password)
  auth(data)
}

function logout() {
  StorageService.set({ [AUTH_TOKEN_NAME]: null })
  router.push('/login')
}

async function register(email: string, password: string, firstName: string, secondName: string) {
  const data = await BaseService.api.register(email, password, firstName, secondName)
  auth(data)
}

export default {
  AUTH_TOKEN_NAME,
  auth,
  login,
  logout,
  register,
}
