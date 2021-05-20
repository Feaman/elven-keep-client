import ApiService from '@/services/api'
import TypeService from '@/services/type'
import ListItemModel, { ListItemDataObject } from './list-item'
import TypeModel from './type'
import StatusModel from './status'
import NoteService from '~/services/note'
import StatusService from '~/services/status'

export interface NoteDataObject {
   id?: number
   title?: string | ''
   text?: string | ''
   type?: TypeModel
   typeId?: number
   statusId?: number
   isCompletedListExpanded?: Boolean
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
  isCompletedListExpanded?: Boolean

  constructor (data: NoteDataObject) {
    this.id = data.id
    this.title = data.title || ''
    this.text = data.text || ''
    this.typeId = data.typeId || TypeService.getDefault().id
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
    const type = TypeService.vuex.state.types.find((_type: TypeModel) => _type.id === this.typeId)
    if (!type) {
      return TypeService.error({ statusCode: 500, message: `Type '${this.typeId}' not found` })
    }

    this.type = type
  }

  handleStatus () {
    const status = TypeService.vuex.state.statuses.find((_status: TypeModel) => _status.id === this.statusId)
    if (!status) {
      return TypeService.error({ statusCode: 500, message: `Status '${this.statusId}' not found` })
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
    return NoteService.vuex.dispatch('addListItem', listItem)
  }

  async save (): Promise<NoteDataObject> {
    if (this.id) {
      return ApiService.updateNote(this)
    } else {
      await NoteService.vuex.dispatch('setNote', this)
      return ApiService.addNote(this)
        .then(noteData => this.updateState({ id: noteData.id }))
        .catch(error => NoteService.error(error))
    }
  }

  async update (data: NoteDataObject) {
    await NoteService.vuex.dispatch('updateNote', { note: this, data })

    if (this.text || this.list.length) {
      return this.save()
    }
  }

  updateState (data: NoteDataObject) {
    return NoteService.vuex.dispatch('updateNote', { note: this, data })
  }

  async remove () {
    await NoteService.vuex.dispatch('unsetNote', this)
    try {
      await ApiService.removeNote(this)
    } catch (error) {
      NoteService.error(error)
    }
  }

  setNoteToListItems () {
    this.list.forEach(listItem => listItem.updateState({ note: this }))
  }
}
