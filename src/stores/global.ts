import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type TGlobalError } from '~/types'
import useUserStore, { IUser, TUserModel } from '../composables/models/user'

export const useGlobalStore = defineStore('global', () => {
  const initError = ref<TGlobalError | undefined>(undefined)
  const isInitDataLoading = ref(false)
  const isSocketError = ref<boolean | undefined>(undefined)
  const user = ref<TUserModel | null>(null)
  const mainListScrollTop = ref(0)
  const isSocketErrorOnce = ref(false)

  function setUser(userData: IUser) {
    user.value = useUserStore(userData) as unknown as TUserModel
  }

  return {
    user,
    initError,
    isInitDataLoading,
    isSocketError,
    isSocketErrorOnce,
    mainListScrollTop,
    setUser,
  }
})
