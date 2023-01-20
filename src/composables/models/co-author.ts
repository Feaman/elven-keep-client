import { ref, UnwrapRef } from 'vue'
import userModel, { TUser, TUserModel } from '~/composables/models/user'

export type TCoAuthor = {
  id?: number,
  noteId: number,
  userId: number,
  statusId: number,
  user: TUser,
}

export default function coAuthorModel(coAuthorData: TCoAuthor) {
  const id = ref(coAuthorData.id)
  const noteId = ref(coAuthorData.noteId)
  const userId = ref(coAuthorData.userId)
  const statusId = ref(coAuthorData.statusId)
  const user = ref(userModel(coAuthorData.user) as unknown as TUserModel)

  return {
    id, noteId, userId, statusId, user,
  }
}

export type TCoAuthorModel = UnwrapRef<ReturnType<typeof coAuthorModel>>
