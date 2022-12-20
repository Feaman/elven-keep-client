import { defineStore } from 'pinia'
import { ref } from 'vue'
import { TGlobalError } from '~/services/base'
import useUserStore, { IUser, TUserModel } from '../composables/models/user'

export const useGlobalStore = defineStore('global', () => {
  const initError = ref<TGlobalError | undefined>(undefined)
  const isInitDataLoading = ref(false)
  const user = ref<TUserModel | null>(null)
  const mainListScrollTop = ref(0)
  const SSESalt = ''

  function setUser(userData: IUser) {
    user.value = useUserStore(userData) as unknown as TUserModel
  }

  return {
    user,
    initError,
    isInitDataLoading,
    mainListScrollTop,
    SSESalt,
    setUser,
  }
})
