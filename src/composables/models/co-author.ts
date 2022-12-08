import { ref, UnwrapRef } from 'vue'
import userModel, { IUser, UserModel } from '~/composables/models/user'

export interface ICoAuthor {
  id?: number,
  noteId: number,
  userId: number,
  statusId: number,
  user: IUser
}

export default function coAuthorModel(coAuthorData: ICoAuthor) {
  const id = ref(coAuthorData.id)
  const noteId = ref(coAuthorData.noteId)
  const userId = ref(coAuthorData.userId)
  const statusId = ref(coAuthorData.statusId)
  const user = ref(userModel(coAuthorData.user) as unknown as UserModel)

  return {
    id, noteId, userId, statusId, user,
  }
}

export type CoAuthorModel = UnwrapRef<ReturnType<typeof coAuthorModel>>
