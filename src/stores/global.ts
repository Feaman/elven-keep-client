import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type TGlobalError } from '~/types'
import useUserStore, { TUser, TUserModel } from '../composables/models/user'

export const useGlobalStore = defineStore('global', () => {
  const initError = ref<TGlobalError | undefined>(undefined)
  // const isOnline = ref<boolean>(window.navigator.onLine)
  const isOnline = ref<boolean>(false)
  const isInitDataLoading = ref(false)
  const isSocketError = ref<boolean | undefined>(undefined)
  const user = ref<TUserModel | null>(null)
  const mainListScrollTop = ref(0)
  const isSocketErrorOnce = ref(false)
  const isNewVersionAvailable = ref(false)
  const isUpdating = ref(false)

  function setUser(userData: TUser) {
    user.value = useUserStore(userData) as unknown as TUserModel
  }

  return {
    user,
    isUpdating,
    initError,
    isNewVersionAvailable,
    isInitDataLoading,
    isSocketError,
    isSocketErrorOnce,
    mainListScrollTop,
    isOnline,
    setUser,
  }
})
