import { NuxtAxiosInstance } from '@nuxtjs/axios'
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import BaseService from './base'
import NoteModel, { INote } from '~/models/note'
import ListItemModel, { IListItem } from '~/models/list-item'
import { IType } from '~/models/type'
import StorageService from '~/services/storage'
import UserService from '~/services/users'
import { IUser } from '~/models/user'
import { IStatus } from '~/models/status'
import CoAuthorModel, { ICoAuthor } from '~/models/co-author'

export interface ConfigObject {
  user: IUser,
  types: IType[],
  statuses: IStatus[],
  notes: NoteModel[],
  token?: string,
}

export default class ApiService extends BaseService {
  static URL = 'https://api.notes.pavlo.ru/'
  static axios: NuxtAxiosInstance
  static redirect: Function
  static noteSavingTimeout: ReturnType<typeof setTimeout> | null = null

  static initInterceptors () {
    this.axios.setBaseURL(this.URL)

    this.axios.onRequest((config: AxiosRequestConfig) => {
      // Auth token
      const token = StorageService.get(UserService.AUTH_TOKEN_NAME)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Set SSE salt
      config.headers['x-sse-salt'] = this.vuex.state.SSESalt

      if (this.noteSavingTimeout) {
        clearTimeout(this.noteSavingTimeout)
      }
      this.noteSavingTimeout = setTimeout(() => this.vuex.commit('setIsNoteSaving', true), 200)
      return config
    })

    this.axios.onResponse((response: AxiosResponse) => {
      if (this.noteSavingTimeout) {
        clearTimeout(this.noteSavingTimeout)
      }

      this.vuex.commit('setIsNoteSaving', false)
      return response
    })

    this.axios.onError((error: AxiosError) => {
      if (error.response) {
        if (error.response.status === 401) {
          if (this.route.name !== 'login') {
            this.redirect('/login')
          }
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

  static addNote (note: NoteModel): Promise<INote> {
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
      order: listItem.order,
      completed: listItem.completed,
    }))

    return this.axios.post('notes', noteData)
      .then((response: AxiosResponse) => response.data)
  }

  static updateNote (note: NoteModel): Promise<INote> {
    const noteData = {
      title: note.title,
      text: note.text,
      typeId: note.typeId,
      isCompletedListExpanded: note.isCompletedListExpanded,
    }
    return this.axios.put(`notes/${note.id}`, noteData)
      .then((response: AxiosResponse) => response.data)
  }

  static removeNote (note: NoteModel) {
    return this.axios.delete(`notes/${note.id}`)
      .then((response: AxiosResponse) => response.data)
  }

  static restoreNote (note: NoteModel) {
    return this.axios.put(`notes/restore/${note.id}`)
      .then((response: AxiosResponse) => response.data)
  }

  static saveListItem (listItem: ListItemModel): Promise<IListItem> {
    const data = {
      text: listItem.text,
      noteId: listItem.note?.id,
      checked: listItem.checked,
      order: listItem.order,
      completed: listItem.completed,
    }
    return this.axios.post('list-items', data)
      .then((response: AxiosResponse) => response.data)
  }

  static updateListItem (listItem: ListItemModel): Promise<IListItem> {
    const data = {
      text: listItem.text,
      checked: listItem.checked,
      order: listItem.order,
      completed: listItem.completed,
    }
    return this.axios.put(`list-items/${listItem.id}`, data)
      .then((response: AxiosResponse) => response.data)
  }

  static removeListItem (listItem: ListItemModel) {
    return this.axios.delete(`list-items/${listItem.id}`)
      .then((response: AxiosResponse) => response.data)
  }

  static restoreListItem (listItem: ListItemModel) {
    return this.axios.put(`list-items/restore/${listItem.id}`)
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

  static addNoteCoAuthor (note: NoteModel, email: string): Promise<ICoAuthor> {
    return this.axios.post(`notes/${note.id}/co-author`, { email })
      .then((response: AxiosResponse) => response.data)
  }

  static removeNoteCoAuthor (coAuthor: CoAuthorModel) {
    return this.axios.delete(`notes/co-author/${coAuthor.id}`)
      .then((response: AxiosResponse) => response.data)
  }

  static setOrder (note: NoteModel, order: number[]) {
    return this.axios.put(`notes/${note.id}/set-order`, { order })
      .then((response: AxiosResponse) => response.data)
  }
}
