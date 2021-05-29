import ApiService from '@/services/api'
import TypesService from '@/services/type'
import ListItemModel, { ListItemDataObject } from './list-item'
import TypeModel from './type'
import StatusModel from './status'
import NotesService from '~/services/note'
import StatusService from '~/services/status'

export interface NoteDataObject {
  id?: number
  title?: string | ''
  text?: string | ''
  type?: TypeModel
  typeId?: number
  statusId?: number
  isCompletedListExpanded?: Boolean
  saveTimeout?: ReturnType<typeof setTimeout> | null
  list?: ListItemDataObject[]
}

export default class NoteModel {
  id?: number
  title: string | ''
  text: string | ''
  list: ListItemModel[] = []
  typeId: number
  statusId: number
  type?: TypeModel
  status?: StatusModel
  saveTimeout: ReturnType<typeof setTimeout> | null = null
  isCompletedListExpanded?: Boolean

  constructor (data: NoteDataObject) {
    this.id = data.id
    this.title = data.title || ''
    this.text = data.text || ''
    this.typeId = data.typeId || TypesService.getDefault().id
    this.statusId = data.statusId || StatusService.getActive().id

    if (data.isCompletedListExpanded) {
      this.isCompletedListExpanded = data.isCompletedListExpanded
    }

    this.handleList(data.list)
    this.handleType()
    this.handleStatus()
  }

  handleList (listData: ListItemDataObject[] = []) {
    listData.forEach(listItemData => this.list.push(new ListItemModel(listItemData)))
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
              resolve(this.updateState({ id: noteData.id }))
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
}
