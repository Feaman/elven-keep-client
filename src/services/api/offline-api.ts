import { TCoAuthor } from '~/composables/models/co-author'
import { TListItemModel, type TListItem } from '~/composables/models/list-item'
import { TNote, TNoteModel } from '~/composables/models/note'
import { TUser } from '~/composables/models/user'
import StatusesService from '~/composables/services/statuses'
import BaseService from '~/services/base'
import { useGlobalStore } from '~/stores/global'
import StorageService from '../storage'
import IApi, { ConfigObject } from './interface'

export default class OfflineApiService implements IApi {
  async getConfig(): Promise<ConfigObject> {
    const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME)
    return Promise.resolve(offlineData as ConfigObject)
  }

  async addNote(
    list: TListItemModel[],
    title: string,
    text: string,
    typeId: number,
    order: number,
    isCompletedListExpanded: boolean,
  ): Promise<TNote> {
    const noteData = {
      title,
      text,
      typeId,
      list: [] as TListItem[],
      order,
      isCompletedListExpanded,
      statusId: StatusesService.active.value.id,
    }

    const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME) as ConfigObject
    const currentDateTime = new Date().toISOString()
    const offlineNoteData = Object.assign(
      noteData,
      {
        id: new Date().getTime(),
        updated: currentDateTime,
        created: currentDateTime,
        userId: useGlobalStore().user?.id,
        user: useGlobalStore().user as TUser,
      },
    )

    offlineData.notes.push(offlineNoteData)
    StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })

    return Promise.resolve(offlineNoteData)
  }

  async getNote(id: number): Promise<TNote> {
    const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME)
    const offlineNote = (offlineData as ConfigObject).notes.find((note) => note.id === id)
    if (!offlineNote) {
      throw new Error(`Note with id ${id} not found in offline data`)
    }
    return Promise.resolve(offlineNote)
  }

  async updateNote(id: number, title: string, text: string, typeId: number, isCompletedListExpanded: boolean): Promise<TNote> {
    const noteData = {
      title,
      text,
      typeId,
      isCompletedListExpanded,
    }

    const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME) as ConfigObject
    const offlineNote = offlineData.notes.find((note) => note.id === id)
    if (!offlineNote) {
      throw new Error(`Note with id ${id} not found in offline data`)
    }
    Object.assign(offlineNote, noteData)
    offlineNote.updated = new Date().toISOString()
    StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })

    return Promise.resolve(offlineNote)
  }

  async removeNote(note: TNoteModel) {
    const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME) as ConfigObject
    const offlineNote = offlineData.notes.find((offlineNote) => offlineNote.id === note.id) as TNoteModel | undefined
    if (!offlineNote) {
      throw new Error(`Offline note with id ${note.id} not found in offline data`)
    }
    offlineNote.statusId = StatusesService.inactive.value.id

    StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })

    return Promise.resolve(offlineNote)
  }

  async restoreNote(noteId: number) {
    const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME) as ConfigObject
    const offlineNote = offlineData.notes.find((offlineNote) => offlineNote.id === noteId) as TNoteModel | undefined
    if (!offlineNote) {
      throw new Error(`Offline note with id ${noteId} not found in offline data`)
    }
    offlineNote.statusId = StatusesService.active.value.id

    StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })

    return Promise.resolve(offlineNote)
  }

  async updateListItem(listItem: TListItemModel): Promise<TListItem> {
    const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME) as ConfigObject
    const listItemData = {
      text: listItem.text,
      checked: listItem.checked,
      order: listItem.order,
      updated: new Date().toISOString(),
      completed: listItem.completed,
    }

    const offlineNote = offlineData.notes.find((offlineNote) => offlineNote.id === listItem.noteId) as TNoteModel | undefined
    if (!offlineNote) {
      throw new Error(`Offline note with id ${listItem.noteId} not found in offline data`)
    }

    const offlineNoteListItem = offlineNote.list.find((offlineNoteListItem) => offlineNoteListItem.id === listItem.id) as TListItem | undefined
    if (!offlineNoteListItem) {
      throw new Error(`Offline note list item with id ${listItem.noteId} not found in offline data`)
    }

    Object.assign(offlineNoteListItem, listItemData)

    StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })

    return Promise.resolve(offlineNoteListItem)
  }

  async addListItem(listItem: TListItemModel): Promise<TListItem> {
    const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME) as ConfigObject
    const currentDateTime = new Date().toISOString()
    const listItemData = {
      id: new Date().getTime(),
      updated: currentDateTime,
      created: currentDateTime,
      text: listItem.text,
      noteId: listItem.noteId,
      checked: listItem.checked,
      order: listItem.order,
      completed: listItem.completed,
      statusId: StatusesService.active.value.id,
    } as TListItem

    const offlineNote = offlineData.notes.find((offlineNote) => offlineNote.id === listItem.noteId)
    if (!offlineNote) {
      throw new Error(`Offline note with id ${listItem.noteId} not found in offline data`)
    }

    if (offlineNote.list) {
      offlineNote.list.push(listItemData)
    }

    StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })

    return Promise.resolve(listItemData)
  }

  async removeListItem(listItem: TListItemModel) {
    const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME) as ConfigObject

    const offlineNote = offlineData.notes.find((offlineNote) => offlineNote.id === listItem.noteId) as TNoteModel | undefined
    if (!offlineNote) {
      throw new Error(`Offline note with id ${listItem.noteId} not found in offline data`)
    }

    const offlineNoteListItem = offlineNote.list.find((offlineNoteListItem) => offlineNoteListItem.id === listItem.id) as TListItem | undefined
    if (!offlineNoteListItem) {
      throw new Error(`Offline note list item with id ${listItem.noteId} not found in offline data`)
    }

    offlineNoteListItem.statusId = StatusesService.inactive.value.id

    StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })
  }

  async restoreListItem(noteId: number, listItemId: number) {
    const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME) as ConfigObject

    const offlineNote = offlineData.notes.find((offlineNote) => offlineNote.id === noteId) as TNoteModel | undefined
    if (!offlineNote) {
      throw new Error(`Offline note with id ${noteId} not found in offline data`)
    }

    const offlineNoteListItem = offlineNote.list.find((offlineNoteListItem) => offlineNoteListItem.id === listItemId) as TListItem | undefined
    if (!offlineNoteListItem) {
      throw new Error(`Offline note list item with id ${listItemId} not found in offline data`)
    }

    offlineNoteListItem.statusId = StatusesService.inactive.value.id

    StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })
  }

  async signIn(): Promise<ConfigObject> {
    throw new Error('This action is not available in offline mode')
  }

  async signUp(): Promise<ConfigObject> {
    throw new Error('This action is not available in offline mode')
  }

  async addNoteCoAuthor(): Promise<TCoAuthor> {
    throw new Error('This action is not available in offline mode')
  }

  async removeNoteCoAuthor() {
    throw new Error('This action is not available in offline mode')
  }

  async setListItemsOrder(note: TNoteModel, order: number[]) {
    throw new Error('This action is not available in offline mode')
  }

  async setNotesOrder(order: number[]) {
    throw new Error('This action is not available in offline mode')
  }

  async updateUser(showChecked: boolean) {
    const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME) as ConfigObject

    offlineData.user.showChecked = showChecked

    StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })
  }
}
