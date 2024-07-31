import { ref, UnwrapRef } from 'vue'
import BaseService from '~/services/base'

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

  function getFio() {
    return `${secondName.value} ${firstName.value}`
  }

  function getInitials() {
    return `${secondName.value.charAt(0).toUpperCase()}${firstName.value.charAt(0).toUpperCase()}`
  }

  async function save() {
    try {
      // const globalStore = useGlobalStore()
      // await BaseService.api.updateUser(!!globalStore.user?.showChecked)
    } catch (error) {
      BaseService.showError(error as Error)
    }
  }

  return {
    id, firstName, secondName, email, getFio, getInitials, save,
  }
}

export type TUserModel = UnwrapRef<ReturnType<typeof userModel>>
