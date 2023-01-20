import { ref, UnwrapRef, watch } from 'vue'
import UsersService from '~/composables/services/users'
import ApiService from '~/services/api/api'
import BaseService from '~/services/base'
import StorageService from '~/services/storage'
import { useGlobalStore } from '~/stores/global'

export type TUser = {
  id: number,
  firstName: string,
  secondName: string,
  email: string,
  showChecked: boolean,
}

export default function userModel(userData: TUser) {
  const id = ref(userData.id)
  const firstName = ref(userData.firstName)
  const secondName = ref(userData.secondName)
  const email = ref(userData.email)
  const showChecked = ref(userData.showChecked)
  const globalStore = useGlobalStore()

  function getFio() {
    return `${secondName.value} ${firstName.value}`
  }

  function getInitials() {
    return `${secondName.value.charAt(0).toUpperCase()}${firstName.value.charAt(0).toUpperCase()}`
  }

  function signOut() {
    StorageService.set({ [UsersService.AUTH_TOKEN_NAME]: null })
    BaseService.router.push('/sign')
  }

  async function save() {
    try {
      await ApiService.updateUser(!!globalStore.user?.showChecked)
    } catch (error) {
      BaseService.showError(error as Error)
    }
  }

  watch(showChecked, () => save())

  return {
    id, firstName, secondName, email, showChecked, getFio, getInitials, signOut, save,
  }
}

export type TUserModel = UnwrapRef<ReturnType<typeof userModel>>
