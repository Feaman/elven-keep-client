import { NuxtAxiosInstance } from '@nuxtjs/axios'
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import BaseService from './base'
import NoteModel, { NoteDataObject } from '~/models/note'
import ListItemModel, { ListItemDataObject } from '~/models/list-item'
import { TypeDataObject } from '~/models/type'
import StorageService from '~/services/storage'
import UserService from '~/services/user'
import { UserDataObject } from '~/models/user'
import { StatusDataObject } from '~/models/status'

export interface ConfigObject {
  user: UserDataObject,
  types: TypeDataObject[],
  statuses: StatusDataObject[],
  notes: NoteModel[],
  token?: string,
}

export default class ApiService extends BaseService {
  static URL = 'https://api.notes.pavlo.ru/'
  static axios: NuxtAxiosInstance
  static redirect: Function
  static noteSavingTimeout: ReturnType<typeof setTimeout> | null = null

  static init () {
    this.axios.setBaseURL(this.URL)

    this.axios.onRequest((config: AxiosRequestConfig) => {
      // Auth token
      const token = StorageService.get(UserService.AUTH_TOKEN_NAME)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      if (this.noteSavingTimeout) {
        clearTimeout(this.noteSavingTimeout)
      }
      this.noteSavingTimeout = setTimeout(async () => await this.vuex.dispatch('setIsNoteSaving', true), 200)
      return config
    })

    this.axios.onResponse(async (response: AxiosResponse) => {
      if (this.noteSavingTimeout) {
        clearTimeout(this.noteSavingTimeout)
      }

      await this.vuex.dispatch('setIsNoteSaving', false)
      return response
    })

    this.axios.onError((error: AxiosError) => {
      if (error.response) {
        debugger
        if (error.response.status === 401) {
          this.redirect('/login')
        } else if (error.response.status !== 400) {
          this.error({ statusCode: error.response.status, message: error.response.data.message })
        }
      } else {
        this.error({ statusCode: 500, message: 'Something goes wrong' })
      }
    })
  }

  static getConfig (): Promise<ConfigObject> {
    return this.axios.get('config')
      .then((response: AxiosResponse) => response.data)
  }

  static addNote (note: NoteModel): Promise<NoteDataObject> {
    const noteData = {
      title: note.title,
      text: note.text,
      typeId: note.typeId,
      list: [] as object[],
      isCompletedListExpanded: note.isCompletedListExpanded,
    }
    note.list.forEach(listItem => noteData.list.push({
      text: listItem.text,
      noteId: listItem.note?.id,
      checked: listItem.checked,
      completed: listItem.completed,
    }))
    return this.axios.post('notes', noteData)
      .then((response: AxiosResponse) => response.data)
  }

  static updateNote (note: NoteModel): Promise<NoteDataObject> {
    const noteData = {
      title: note.title.trim(),
      text: note.text.trim(),
      typeId: note.typeId,
      isCompletedListExpanded: note.isCompletedListExpanded,
    }
    return this.axios.put(`notes/${note.id}`, noteData)
      .then((response: AxiosResponse) => response.data)
  }

  static saveListItem (listItem: ListItemModel): Promise<ListItemDataObject> {
    const data = {
      text: listItem.text,
      noteId: listItem.note?.id,
      checked: listItem.checked,
      completed: listItem.completed,
    }
    return this.axios.post('list-items', data)
      .then((response: AxiosResponse) => response.data)
  }

  static updateListItem (listItem: ListItemModel): Promise<ListItemDataObject> {
    const data = {
      text: listItem.text?.trim(),
      checked: listItem.checked,
      completed: listItem.completed,
    }
    return this.axios.put(`list-items/${listItem.id}`, data)
      .then((response: AxiosResponse) => response.data)
  }

  static removeListItem (listItem: ListItemModel) {
    return this.axios.delete(`list-items/${listItem.id}`)
      .then((response: AxiosResponse) => response.data)
  }

  static removeNote (note: NoteModel) {
    return this.axios.delete(`notes/${note.id}`)
      .then((response: AxiosResponse) => response.data)
  }

  static login (email: string, password: string): Promise<ConfigObject> {
    return this.axios.post('login', { email, password })
      .then((response: AxiosResponse) => response.data)
  }

  static register (email: string, password: string, firstName: string, secondName: string): Promise<ConfigObject> {
    return this.axios.post('users', { email, password, firstName, secondName })
      .then((response: AxiosResponse) => response.data)
  }
}
