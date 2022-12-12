import { ref, UnwrapRef } from 'vue'
import UsersService from '~/composables/services/users'
import BaseService from '~/services/base'
import StorageService from '~/services/storage'

export interface IUser {
  id: number,
  firstName: string,
  secondName: string,
  email: string,
}

export default function userModel(userData: IUser) {
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

  function signOut() {
    StorageService.set({ [UsersService.AUTH_TOKEN_NAME]: null })
    BaseService.router.push('/sign')
  }

  return {
    id, firstName, secondName, email, getFio, getInitials, signOut,
  }
}

export type TUserModel = UnwrapRef<ReturnType<typeof userModel>>
