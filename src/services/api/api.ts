import { CoAuthorModel, ICoAuthor } from '~/composables/models/co-author'
import { IListItem, ListItemModel } from '~/composables/models/list-item'
import { INote, NoteModel } from '~/composables/models/note'
import { IStatus } from '~/composables/models/status'
import { IType } from '~/composables/models/type'
import { IUser } from '~/composables/models/user'
import BaseService from '../base'
import IApi from './interface'

export interface ConfigObject {
  user: IUser,
  types: IType[],
  statuses: IStatus[],
  notes: INote[],
  token?: string,
}

export default class ApiService extends BaseService {
  api

  constructor(api: IApi) {
    super()
    this.api = api
  }

  async getConfig(): Promise<ConfigObject> {
    const { data } = await this.api.get('config')
    return data as ConfigObject
  }

  async addNote(note: NoteModel): Promise<INote> {
    const noteData = {
      title: note.title,
      text: note.text,
      typeId: note.typeId,
      list: [] as object[],
      isCompletedListExpanded: note.isCompletedListExpanded,
    }

    note.list.forEach((listItem: ListItemModel) => noteData.list.push({
      text: listItem.text,
      noteId: listItem.note?.id,
      checked: listItem.checked,
      order: listItem.order,
      completed: listItem.completed,
    }))

    const { data } = await this.api.post('notes', noteData)
    return data as INote
  }

  async updateNote(note: NoteModel): Promise<INote> {
    const noteData = {
      title: note.title,
      text: note.text,
      typeId: note.typeId,
      isCompletedListExpanded: note.isCompletedListExpanded,
    }
    const { data } = await this.api.put(`notes/${note.id}`, noteData)
    return data as INote
  }

  async removeNote(note: NoteModel) {
    const { data } = await this.api.delete(`notes/${note.id}`)
    return data
  }

  async restoreNote(note: NoteModel) {
    const { data } = await this.api.put(`notes/restore/${note.id}`)
    return data
  }

  async updateListItem(listItem: ListItemModel): Promise<IListItem> {
    const listItemData = {
      text: listItem.text,
      checked: listItem.checked,
      order: listItem.order,
      completed: listItem.completed,
    }
    const { data } = await this.api.put(`list-items/${listItem.id}`, listItemData)
    return data as IListItem
  }

  async addListItem(listItem: ListItemModel): Promise<IListItem> {
    const listItemData = {
      text: listItem.text,
      noteId: listItem.note?.id,
      checked: listItem.checked,
      order: listItem.order,
      completed: listItem.completed,
    }
    const { data } = await this.api.post('list-items', listItemData)
    return data as IListItem
  }

  async removeListItem(listItem: ListItemModel) {
    const { data } = await this.api.delete(`list-items/${listItem.id}`)
    return data
  }

  async restoreListItem(listItem: ListItemModel) {
    const { data } = await this.api.put(`list-items/restore/${listItem.id}`)
    return data
  }

  async login(email: string, password: string): Promise<ConfigObject> {
    const { data } = await this.api.post('login', { email, password })
    return data as ConfigObject
  }

  async register(email: string, password: string, firstName: string, secondName: string): Promise<ConfigObject> {
    const { data } = await this.api.post('users', {
      email, password, firstName, secondName,
    })
    return data as ConfigObject
  }

  async addNoteCoAuthor(note: NoteModel, email: string): Promise<ICoAuthor> {
    const { data } = await this.api.post(`notes/${note.id}/co-author`, { email })
    return data as ICoAuthor
  }

  async removeNoteCoAuthor(coAuthor: CoAuthorModel) {
    const { data } = await this.api.delete(`notes/co-author/${coAuthor.id}`)
    return data as CoAuthorModel
  }

  async setOrder(note: NoteModel, order: number[]) {
    const { data } = await this.api.put(`notes/${note.id}/set-order`, { order })
    return data
  }
}