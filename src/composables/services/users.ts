import { computed } from 'vue'
import { ConfigObject } from '~/services/api/interface'
import BaseService from '~/services/base'
import InitService from '~/services/init'
import StorageService from '~/services/storage'
import { useGlobalStore } from '~/stores/global'

const AUTH_TOKEN_NAME = 'auth-token'

function auth(data: ConfigObject) {
  StorageService.set({ [AUTH_TOKEN_NAME]: data.token })
  return InitService.initApplication(data)
}

async function signIn(email: string, password: string) {
  const data = await BaseService.api.signIn(email, password)
  auth(data)
}

async function register(email: string, password: string, firstName: string, secondName: string) {
  const data = await BaseService.api.signUp(email, password, firstName, secondName)
  auth(data)
}

function signOut() {
  InitService.clearApplication()
  BaseService.router.push('/sign')
}

export const isWatch = computed(() => {
  const globalStore = useGlobalStore()
  return Number(globalStore?.user?.id) === 1
  && window.navigator.userAgent.toLocaleLowerCase().includes('samsungbrowser')
})

export default {
  AUTH_TOKEN_NAME,
  auth,
  signIn,
  signOut,
  register,
}
