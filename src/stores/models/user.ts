import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface IUser {
  id?: number,
  firstName: string,
  secondName: string,
  email: string,
}

export default function useUserStore(userData: IUser) {
  return defineStore(`user-${userData.id}`, () => {
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
  })()
}

export type UserModel = ReturnType<typeof useUserStore>
