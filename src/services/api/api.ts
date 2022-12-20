import { ICoAuthor, TCoAuthorModel } from '~/composables/models/co-author'
import { TListItemModel, type TListItem } from '~/composables/models/list-item'
import { TNote, TNoteModel } from '~/composables/models/note'
import { IStatus } from '~/composables/models/status'
import { IType } from '~/composables/models/type'
import { IUser } from '~/composables/models/user'
import AxiosApi from '~/services/api/axios-api'
import BaseService from '~/services/base'

export interface ConfigObject {
  user: IUser,
  types: IType[],
  statuses: IStatus[],
  notes: TNote[],
  token?: string,
}

export default class ApiService extends BaseService {
  static api: AxiosApi

  static async getConfig(): Promise<ConfigObject> {
    const { data } = await this.api.get('config')
    return data as ConfigObject
  }

  static async addNote(
    list: TListItemModel[],
    title: string,
    text: string,
    typeId: number,
    isCompletedListExpanded: boolean,
  ): Promise<TNote> {
    const noteData = {
      title,
      text,
      typeId,
      list: [] as TListItem[],
      isCompletedListExpanded,
    }

    list.forEach((listItem: TListItemModel) => noteData.list.push({
      text: listItem.text,
      noteId: listItem.noteId,
      checked: listItem.checked,
      order: listItem.order,
      completed: listItem.completed,
    }))

    const { data } = await this.api.post('notes', noteData)
    return data as TNote
  }

  static async updateNote(id: number, title: string, text: string, typeId: number, isCompletedListExpanded: boolean): Promise<TNote> {
    const noteData = {
      title,
      text,
      typeId,
      isCompletedListExpanded,
    }
    const { data } = await this.api.put(`notes/${id}`, noteData)
    return data as TNote
  }

  static async removeNote(note: TNoteModel) {
    const { data } = await this.api.delete(`notes/${note.id}`)
    return data
  }

  static async restoreNote(noteId: number) {
    const { data } = await this.api.put(`notes/restore/${noteId}`)
    return data
  }

  static async updateListItem(listItem: TListItemModel): Promise<TListItem> {
    const listItemData = {
      text: listItem.text,
      checked: listItem.checked,
      order: listItem.order,
      completed: listItem.completed,
    }
    const { data } = await this.api.put(`list-items/${listItem.id}`, listItemData)
    return data as TListItem
  }

  static async addListItem(listItem: TListItemModel): Promise<TListItem> {
    const listItemData = {
      text: listItem.text,
      noteId: listItem.noteId,
      checked: listItem.checked,
      order: listItem.order,
      completed: listItem.completed,
    }

    const { data } = await this.api.post('list-items', listItemData)
    return data as TListItem
  }

  static async removeListItem(listItem: TListItemModel) {
    const { data } = await this.api.delete(`list-items/${listItem.id}`)
    return data
  }

  static async restoreListItem(listItemId: number) {
    const { data } = await this.api.put(`list-items/restore/${listItemId}`)
    return data
  }

  static async signIn(email: string, password: string): Promise<ConfigObject> {
    const { data } = await this.api.post('login', { email, password })
    return data as ConfigObject
  }

  static async signUp(email: string, password: string, firstName: string, secondName: string): Promise<ConfigObject> {
    const { data } = await this.api.post('users', {
      email, password, firstName, secondName,
    })
    return data as ConfigObject
  }

  static async addNoteCoAuthor(noteId: number, email: string): Promise<ICoAuthor> {
    const { data } = await this.api.post(`notes/${noteId}/co-author`, { email })
    return data as ICoAuthor
  }

  static async removeNoteCoAuthor(coAuthor: TCoAuthorModel) {
    const { data } = await this.api.delete(`notes/co-author/${coAuthor.id}`)
    return data as TCoAuthorModel
  }

  static async setOrder(note: TNoteModel, order: number[]) {
    const { data } = await this.api.put(`notes/${note.id}/set-order`, { order })
    return data
  }

  static async updateUser(showChecked: boolean) {
    const userData = {
      showChecked,
    }
    const { data } = await this.api.put('users', userData)
    return data
  }
}
