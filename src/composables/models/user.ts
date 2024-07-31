import { ref, UnwrapRef } from 'vue'
import BaseService from '~/services/base'
import InitService from '~/services/init'
import { useGlobalStore } from '~/stores/global'

export type TUser = {
  id: number,
  firstName: string,
  secondName: string,
  email: string,
}

export default function userModel(userData: TUser) {
  const id = ref(userData.id)
  const firstName = ref(userData.firstName)
  const secondName = ref(userData.secondName)
  const email = ref(userData.email)
  const globalStore = useGlobalStore()

  function getFio() {
    return `${secondName.value} ${firstName.value}`
  }

  function getInitials() {
    return `${secondName.value.charAt(0).toUpperCase()}${firstName.value.charAt(0).toUpperCase()}`
  }

  function signOut() {
    InitService.clearApplication()
    BaseService.router.push('/sign')
  }

  async function save() {
    try {
      // await BaseService.api.updateUser(!!globalStore.user?.showChecked)
    } catch (error) {
      BaseService.showError(error as Error)
    }
  }

  return {
    id, firstName, secondName, email, getFio, getInitials, signOut, save,
  }
}

export type TUserModel = UnwrapRef<ReturnType<typeof userModel>>
