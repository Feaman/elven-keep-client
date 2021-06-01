import ApiService from '@/services/api'
import ListItemModel, { ListItemDataObject } from './list-item'
import TypeModel from './type'
import StatusModel from './status'
import UserModel, { UserDataObject } from './user'
import CoAuthorModel, { CoAuthorDataObject } from './co-author'
import TypesService from '~/services/types'
import NotesService from '~/services/notes'
import StatusService from '~/services/statuses'

export interface NoteDataObject {
  id?: number
  title?: string | ''
  text?: string | ''
  type?: TypeModel
  typeId?: number
  statusId?: number
  userId?: number
  user?: UserDataObject
  isCompletedListExpanded?: Boolean
  saveTimeout?: ReturnType<typeof setTimeout> | null
  list?: ListItemDataObject[]
  coAuthors?: CoAuthorDataObject[]
}

export default class NoteModel {
  id?: number
  title: string | ''
  text: string | ''
  list: ListItemModel[] = []
  typeId: number
  statusId: number
  userId?: number
  type?: TypeModel
  status?: StatusModel
  user?: UserModel
  saveTimeout: ReturnType<typeof setTimeout> | null = null
  isCompletedListExpanded?: Boolean
  coAuthors: CoAuthorModel[] = []

  constructor (data: NoteDataObject) {
    this.id = data.id
    this.title = data.title || ''
    this.userId = data.userId
    this.text = data.text || ''
    this.typeId = data.typeId || TypesService.getDefault().id
    this.statusId = data.statusId || StatusService.getActive().id

    if (data.user) {
      this.user = new UserModel(data.user)
    }

    if (data.isCompletedListExpanded) {
      this.isCompletedListExpanded = data.isCompletedListExpanded
    }

    this.handleList(data.list)
    this.handleCoAuthors(data.coAuthors)
    this.handleType()
    this.handleStatus()
  }

  handleList (listData: ListItemDataObject[] = []) {
    listData.forEach(listItemData => this.list.push(new ListItemModel(listItemData)))
  }

  handleCoAuthors (coAuthorsData: CoAuthorDataObject[] = []) {
    coAuthorsData.forEach(coAuthorData => this.coAuthors.push(new CoAuthorModel(coAuthorData)))
  }

  handleType () {
    const type = TypesService.vuex.state.types.find((_type: TypeModel) => _type.id === this.typeId)
    if (!type) {
      return TypesService.error({ statusCode: 500, message: `Type '${this.typeId}' not found` })
    }

    this.type = type
  }

  handleStatus () {
    const status = TypesService.vuex.state.statuses.find((_status: TypeModel) => _status.id === this.statusId)
    if (!status) {
      return TypesService.error({ statusCode: 500, message: `Status '${this.statusId}' not found` })
    }

    this.status = status
  }

  isList () {
    return this.type?.name === TypeModel.TYPE_LIST
  }

  isText () {
    return this.type?.name === TypeModel.TYPE_TEXT
  }

  addListItem (listItem: ListItemModel) {
    listItem.note = this
    return NotesService.vuex.dispatch('addListItem', listItem)
  }

  async save (savingText: boolean = false): Promise<NoteDataObject> {
    await NotesService.vuex.dispatch('clearNoteTimeout', this)
    return new Promise((resolve) => {
      const saveTimeout = setTimeout(async () => {
        if (this.id) {
          ApiService.updateNote(this)
            .then(data => resolve(data))
            .catch(error => NotesService.error(error))
        } else {
          await NotesService.vuex.dispatch('setNote', this)
          return ApiService.addNote(this)
            .then(noteData => {
              history.replaceState({}, '', `/notes/${noteData.id}`)
              const newNoteData: NoteDataObject = {
                id: noteData.id,
                userId: noteData.userId,
              }
              if (noteData.user) {
                newNoteData.user = new UserModel(noteData.user)
              }
              resolve(this.updateState(newNoteData))
            })
            .catch(error => NotesService.error(error))
        }
      }, savingText ? 400 : 0)
      this.updateState({ saveTimeout })
    })
  }

  async update (data: NoteDataObject) {
    await NotesService.vuex.dispatch('updateNote', { note: this, data })

    if (this.title || this.text || this.list.length) {
      return this.save(!!(data.text || data.title))
    } else {
      await NotesService.vuex.dispatch('clearNoteTimeout', this)
    }
  }

  updateState (data: NoteDataObject) {
    return NotesService.vuex.dispatch('updateNote', { note: this, data })
  }

  async remove () {
    await NotesService.vuex.dispatch('unsetNote', this)
    try {
      await ApiService.removeNote(this)
    } catch (error) {
      NotesService.error(error)
    }
  }

  setNoteToListItems () {
    this.list.forEach(listItem => listItem.updateState({ note: this }))
  }

  async removeCoAuthor (coAuthor: CoAuthorModel) {
    await NotesService.vuex.dispatch('removeNoteCoAuthor', { note: this, coAuthor })
    return ApiService.removeNoteCoAuthor(coAuthor)
  }
}
