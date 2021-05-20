import { NuxtAxiosInstance } from '@nuxtjs/axios'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import BaseService from './base'
import NoteModel, { NoteDataObject } from '~/models/note'
import ListItemModel, { ListItemDataObject } from '~/models/list-item'
import { TypeDataObject } from '~/models/type'

export default class ApiService extends BaseService {
  static URL = 'https://api.notes.pavlo.ru/'
  static axios: NuxtAxiosInstance

  static init () {
    this.axios.setBaseURL(this.URL)

    this.axios.onRequest((config: AxiosRequestConfig) => {
      this.vuex.dispatch('setIsNoteSaving', true)
      return config
    })

    this.axios.onResponse((response: AxiosResponse) => {
      this.vuex.dispatch('setIsNoteSaving', false)
      return response
    })
  }

  static getNotes (): Promise<NoteDataObject[]> {
    return this.axios.get('notes')
      .then((response: AxiosResponse) => {
        response.data.forEach((note: any) => {
          note.typeId = note.type_id
          note.isCompletedListExpanded = !!note.is_completed_list_expanded
        })
        return response.data
      })
  }

  static getTypes (): Promise<TypeDataObject[]> {
    return this.axios.get('types')
      .then((response: AxiosResponse) => response.data)
  }

  static getStatuses (): Promise<TypeDataObject[]> {
    return this.axios.get('statuses')
      .then((response: AxiosResponse) => response.data)
  }

  static addNote (note: NoteModel): Promise<NoteDataObject> {
    const noteData = {
      title: note.title,
      text: note.text,
      typeId: note.typeId,
      list: [] as object[],
      is_completed_list_expanded: note.isCompletedListExpanded,
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
      title: note.title,
      text: note.text,
      typeId: note.typeId,
      is_completed_list_expanded: note.isCompletedListExpanded,
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
      text: listItem.text,
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
}
