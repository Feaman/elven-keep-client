import ApiService from '@/services/api'
import ListItemModel, { IListItem } from './list-item'
import StatusModel from './status'
import TypeModel from './type'
import UserModel, { IUser } from './user'
import CoAuthorModel, { ICoAuthor } from './co-author'
import TypesService from '~/services/types'
import NotesService from '~/services/notes'
import StatusService from '~/services/statuses'
import StatusesService from '~/services/statuses'
import BaseService from '~/services/base'

export interface INote {
  id?: number
  title?: string | ''
  text?: string | ''
  type?: TypeModel
  typeId?: number
  statusId?: number
  status?: StatusModel
  userId?: number
  user?: IUser
  isCompletedListExpanded?: Boolean
  saveTimeout?: ReturnType<typeof setTimeout> | null
  list?: IListItem[]
  coAuthors?: ICoAuthor[]
  created?: string
  updated?: string
}

export default class NoteModel {
  id?: number
  title: string | ''
  text: string | ''
  list: ListItemModel[] = []
  userId?: number
  typeId: number
  type?: TypeModel
  statusId: number
  status: StatusModel
  user?: UserModel
  saveTimeout: ReturnType<typeof setTimeout> | null = null
  isCompletedListExpanded?: Boolean
  coAuthors: CoAuthorModel[] = []
  created: Date | null = null
  updated: Date | null = null

  constructor (data: INote) {
    this.id = data.id
    this.title = data.title || ''
    this.userId = data.userId
    this.text = data.text || ''
    this.typeId = data.typeId || TypesService.getDefault().id
    this.statusId = data.statusId || StatusService.getActive().id
    this.created = data.created ? new Date(data.created) : null
    this.updated = data.updated ? new Date(data.updated) : null
    this.statusId = data.statusId || StatusesService.getActive().id
    this.status = StatusesService.findById(this.statusId)

    if (data.user) {
      this.user = new UserModel(data.user)
    }

    if (data.isCompletedListExpanded) {
      this.isCompletedListExpanded = data.isCompletedListExpanded
    }

    this.handleList(data.list)
    this.handleCoAuthors(data.coAuthors)
    this.handleType()
  }

  handleList (listData: IListItem[] = []) {
    listData.forEach(listItemData => this.list.push(new ListItemModel(listItemData)))
  }

  handleCoAuthors (coAuthorsData: ICoAuthor[] = []) {
    coAuthorsData.forEach(coAuthorData => this.coAuthors.push(new CoAuthorModel(coAuthorData)))
  }

  handleType () {
    const type = TypesService.vuex.state.types.find((_type: TypeModel) => _type.id === this.typeId)
    if (!type) {
      return TypesService.error({ statusCode: 500, message: `Type '${this.typeId}' not found` })
    }

    this.type = type
  }

  isList () {
    return this.type?.name === TypeModel.TYPE_LIST
  }

  isText () {
    return this.type?.name === TypeModel.TYPE_TEXT
  }

  addListItem (listItemData: IListItem | null = null) {
    const order = this.list.length ? Math.max.apply(Math, this.list.map(listItem => listItem.order)) + 1 : 1
    const listItem = new ListItemModel(
      Object.assign(
        {
          noteId: this.id,
          updated: new Date(),
          order,
        },
        listItemData || { text: '' },
        {
          note: this,
        },
      )
    )
    NotesService.vuex.commit('addListItem', listItem)
    return listItem
  }

  save (savingText: boolean = false): Promise<INote> {
    NotesService.vuex.commit('clearNoteTimeout', this)
    return new Promise((resolve) => {
      const saveTimeout = setTimeout(() => {
        if (this.id) {
          ApiService.updateNote(this)
            .then(data => resolve(data))
            .catch(error => NotesService.error(error))
        } else {
          NotesService.vuex.commit('addNote', this)
          return ApiService.addNote(this)
            .then(noteData => {
              history.replaceState({}, '', `/notes/${noteData.id}`)
              const newNoteData: INote = {
                id: noteData.id,
                userId: noteData.userId,
              }
              if (noteData.user) {
                newNoteData.user = new UserModel(noteData.user)
              }
              this.updateState(newNoteData)
              resolve(newNoteData)
            })
            .catch(error => NotesService.error(error))
        }
      }, savingText ? 400 : 0)
      this.updateState({ saveTimeout })
    })
  }

  update (data: INote) {
    NotesService.vuex.commit('updateNote', { note: this, data })
    return this.save(!!(data.text || data.title))
  }

  updateState (data: INote) {
    NotesService.vuex.commit('updateNote', { note: this, data })
  }

  removeFromState () {
    BaseService.vuex.commit('removeNote', this)
  }

  async remove (addRemovingNote = true) {
    this.hide(addRemovingNote)
    try {
      await ApiService.removeNote(this)
    } catch (error) {
      NotesService.error(error)
    }
  }

  setNoteToListItems () {
    this.list.forEach(listItem => listItem.updateState({ note: this }))
  }

  removeCoAuthor (coAuthor: CoAuthorModel) {
    NotesService.vuex.commit('removeNoteCoAuthor', { note: this, coAuthor })
    return ApiService.removeNoteCoAuthor(coAuthor)
  }

  restore () {
    if (this.id) {
      this.setStatus(StatusesService.getActive())
      return ApiService.restoreNote(this)
        .catch(error => BaseService.error(error))
    } else {
      return Promise.resolve()
    }
  }

  hide (addRemovingNote = true) {
    this.setStatus(StatusesService.getInActive())
    if (addRemovingNote) {
      BaseService.vuex.commit('addRemovingNote', this)
    }
  }

  setStatus (status: StatusModel) {
    this.updateState({ statusId: status.id, status })
  }
}
