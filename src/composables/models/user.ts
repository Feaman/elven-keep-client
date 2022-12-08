import { ref, UnwrapRef } from 'vue'

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

  return {
    id, firstName, secondName, email, getFio, getInitials,
  }
}

export type UserModel = UnwrapRef<ReturnType<typeof userModel>>
