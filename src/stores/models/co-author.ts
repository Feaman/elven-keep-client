import { defineStore } from 'pinia'
import { ref } from 'vue'
import { IUser } from '~/stores/models/user'

export interface ICoAuthor {
  id?: number,
  noteId: number,
  userId: number,
  statusId: number,
  user: IUser
}

export function useCoAuthorStore(coAuthorData: ICoAuthor) {
  return defineStore(`coAuthor-${coAuthorData.id}`, () => {
    const id = ref(coAuthorData.id)
    const noteId = ref(coAuthorData.noteId)
    const userId = ref(coAuthorData.userId)
    const statusId = ref(coAuthorData.statusId)
    const user = ref(coAuthorData.user)

    return {
      id, noteId, userId, statusId, user,
    }
  })()
}

export type CoAuthorModel = ReturnType<typeof useCoAuthorStore>
