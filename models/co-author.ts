import UserModel, { UserDataObject } from "./user"

export interface CoAuthorDataObject {
  id?: number,
  noteId: number,
  userId: number,
  statusId: number,
  user: UserDataObject
}

export default class CoAuthorModel {
  id?: number
  noteId: number
  userId: number
  statusId: number
  user: UserModel

  constructor (data: CoAuthorDataObject) {
    this.id = data.id
    this.noteId = data.noteId
    this.userId = data.userId
    this.statusId = data.statusId
    this.user = new UserModel(data.user)
  }
}
