import { TCoAuthor, TCoAuthorModel } from '~/composables/models/co-author'
import { TListItemModel, type TListItem } from '~/composables/models/list-item'
import { TNote, TNoteModel } from '~/composables/models/note'
import { useGlobalStore } from '~/stores/global'
import IApi, { ConfigObject } from './interface'
import OfflineApiService from './offline-api'
import OnlineApiService from './online-api'

export default class ApiService implements IApi {
  onlineApiService

  offlineApiService

  constructor() {
    this.onlineApiService = new OnlineApiService()
    this.offlineApiService = new OfflineApiService()
  }

  async getConfig(): Promise<ConfigObject> {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.getConfig()
    }

    return this.onlineApiService.getConfig()
  }

  async addNote(
    list: TListItemModel[],
    title: string,
    text: string,
    typeId: number,
    order: number,
    isCompletedListExpanded: boolean,
  ): Promise<TNote> {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.addNote(list, title, text, typeId, order, isCompletedListExpanded)
    }

    return this.onlineApiService.addNote(list, title, text, typeId, order, isCompletedListExpanded)
  }

  async getNote(id: number): Promise<TNote> {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.getNote(id)
    }

    return this.onlineApiService.getNote(id)
  }

  async updateNote(id: number, title: string, text: string, typeId: number, isCompletedListExpanded: boolean): Promise<TNote> {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.updateNote(id, title, text, typeId, isCompletedListExpanded)
    }

    return this.onlineApiService.updateNote(id, title, text, typeId, isCompletedListExpanded)
  }

  async removeNote(note: TNoteModel) {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.removeNote(note)
    }

    return this.onlineApiService.removeNote(note)
  }

  async restoreNote(noteId: number) {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.restoreNote(noteId)
    }

    return this.onlineApiService.restoreNote(noteId)
  }

  async updateListItem(listItem: TListItemModel): Promise<TListItem> {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.updateListItem(listItem)
    }

    return this.onlineApiService.updateListItem(listItem)
  }

  async addListItem(listItem: TListItemModel): Promise<TListItem> {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.addListItem(listItem)
    }

    return this.onlineApiService.addListItem(listItem)
  }

  async removeListItem(listItem: TListItemModel) {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.removeListItem(listItem)
    }

    return this.onlineApiService.removeListItem(listItem)
  }

  async restoreListItem(noteId: number, listItemId: number) {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.restoreListItem(noteId, listItemId)
    }

    return this.onlineApiService.restoreListItem(noteId, listItemId)
  }

  async signIn(email: string, password: string): Promise<ConfigObject> {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.signIn()
    }

    return this.onlineApiService.signIn(email, password)
  }

  async signUp(email: string, password: string, firstName: string, secondName: string): Promise<ConfigObject> {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.signUp()
    }

    return this.onlineApiService.signUp(email, password, firstName, secondName)
  }

  async addNoteCoAuthor(noteId: number, email: string): Promise<TCoAuthor> {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.addNoteCoAuthor()
    }

    return this.onlineApiService.addNoteCoAuthor(noteId, email)
  }

  async removeNoteCoAuthor(coAuthor: TCoAuthorModel) {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.removeNoteCoAuthor()
    }

    return this.onlineApiService.removeNoteCoAuthor(coAuthor)
  }

  async setListItemsOrder(note: TNoteModel, order: number[]) {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.setListItemsOrder(note, order)
    }

    return this.onlineApiService.setListItemsOrder(note, order)
  }

  async setNotesOrder(order: number[]) {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.setNotesOrder(order)
    }

    return this.onlineApiService.setNotesOrder(order)
  }

  async updateUser(showChecked: boolean) {
    if (!useGlobalStore().isOnline) {
      return this.offlineApiService.updateUser(showChecked)
    }

    return this.onlineApiService.updateUser(showChecked)
  }
}
