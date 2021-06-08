import UserModel, { IUser } from "./user"

export interface ICoAuthor {
  id?: number,
  noteId: number,
  userId: number,
  statusId: number,
  user: IUser
}

export default class CoAuthorModel {
  id?: number
  noteId: number
  userId: number
  statusId: number
  user: UserModel

  constructor (data: ICoAuthor) {
    this.id = data.id
    this.noteId = data.noteId
    this.userId = data.userId
    this.statusId = data.statusId
    this.user = new UserModel(data.user)
  }
}
