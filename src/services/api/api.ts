import { TCoAuthor, TCoAuthorModel } from '~/composables/models/co-author'
import { TListItemModel, type TListItem } from '~/composables/models/list-item'
import { TNote, TNoteModel } from '~/composables/models/note'
import { IStatus } from '~/composables/models/status'
import { IType } from '~/composables/models/type'
import { TUser } from '~/composables/models/user'
import AxiosApi from '~/services/api/axios-api'
import BaseService from '~/services/base'
import { useGlobalStore } from '~/stores/global'
import StorageService from '../storage'

export interface ConfigObject {
  user: TUser,
  types: IType[],
  statuses: IStatus[],
  notes: TNote[],
  token?: string,
}

export default class ApiService extends BaseService {
  static api: AxiosApi

  static async getConfig(): Promise<ConfigObject> {
    const store = useGlobalStore()
    if (!store.isOnline) {
      const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME)
      return Promise.resolve(offlineData as ConfigObject)
    }

    const { data } = await this.api.get('config')
    return data as ConfigObject
  }

  static async addNote(
    list: TListItemModel[],
    title: string,
    text: string,
    typeId: number,
    order: number,
    isCompletedListExpanded: boolean,
  ): Promise<TNote> {
    const store = useGlobalStore()
    const noteData = {
      title,
      text,
      typeId,
      list: [] as TListItem[],
      order,
      isCompletedListExpanded,
    }

    if (!store.isOnline) {
      const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME) as ConfigObject
      const currentDateTime = new Date().toISOString()
      StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })
      const offlineNoteData = Object.assign(noteData, {
        id: new Date().getTime(),
        updated: currentDateTime,
        created: currentDateTime,
      })
      offlineData.notes.push(offlineNoteData)
      StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })

      return Promise.resolve(offlineNoteData)
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

  static async getNote(id: number): Promise<TNote> {
    const store = useGlobalStore()
    if (!store.isOnline) {
      const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME)
      const offlineNote = (offlineData as ConfigObject).notes.find((note) => note.id === id)
      if (!offlineNote) {
        throw new Error(`Note with id ${id} not found in local data`)
      }
      return Promise.resolve(offlineNote)
    }

    const { data } = await this.api.get(`notes/${id}`)
    return data as TNote
  }

  static async updateNote(id: number, title: string, text: string, typeId: number, isCompletedListExpanded: boolean): Promise<TNote> {
    const noteData = {
      title,
      text,
      typeId,
      isCompletedListExpanded,
    }

    const store = useGlobalStore()
    if (!store.isOnline) {
      const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME) as ConfigObject
      const offlineNote = offlineData.notes.find((note) => note.id === id)
      if (!offlineNote) {
        throw new Error(`Note with id ${id} not found in local data`)
      }
      Object.assign(offlineNote, noteData)
      offlineNote.updated = new Date().toISOString()
      StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })

      return Promise.resolve(offlineNote)
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

  static async addNoteCoAuthor(noteId: number, email: string): Promise<TCoAuthor> {
    const { data } = await this.api.post(`notes/${noteId}/co-author`, { email })
    return data as TCoAuthor
  }

  static async removeNoteCoAuthor(coAuthor: TCoAuthorModel) {
    const { data } = await this.api.delete(`notes/co-author/${coAuthor.id}`)
    return data as TCoAuthorModel
  }

  static async setListItemsOrder(note: TNoteModel, order: number[]) {
    const { data } = await this.api.put(`notes/${note.id}/set-order`, { order })
    return data
  }

  static async setNotesOrder(order: number[]) {
    const { data } = await this.api.put('notes/set-order', { order })
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
