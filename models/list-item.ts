import NoteModel from './note'
import StatusModel from './status'
import BaseService from '~/services/base'
import ApiService from '~/services/api'
import ListItemsService from '~/services/list-items'
import StatusesService from '~/services/statuses'

export type Variant = {
  noteId: number,
  listItemId: number,
  text: string,
  isExists: boolean,
  focused: boolean,
}

export interface IListItem {
  id?: number
  noteId?: number
  order?: number
  text?: string | ''
  note?: NoteModel | undefined
  focused?: Boolean
  checked?: Boolean
  completed?: Boolean
  statusId?: number
  status?: StatusModel
  created?: string
  updated?: string
}

export default class ListItemModel {
  id?: number
  _id: string
  text?: string | ''
  note: NoteModel | undefined
  focused: Boolean
  order: number
  checked: Boolean
  completed: Boolean
  noteId: number | undefined
  created: Date | null = null
  updated: Date | null = null
  statusId: number
  status: StatusModel

  constructor (data: IListItem) {
    this.id = data.id
    this._id = `${(new Date()).getMilliseconds()}-${this.id}`
    this.text = data.text
    this.noteId = data.noteId
    this.note = data.note
    this.order = data.order || 0
    this.focused = data.focused || false
    this.checked = data.checked || false
    this.completed = data.completed || false
    this.created = data.created ? new Date(data.created) : null
    this.updated = data.updated ? new Date(data.updated) : null
    this.statusId = data.statusId || StatusesService.getActive().id
    this.status = StatusesService.findById(this.statusId)
  }

  async save () {
    if (!this?.note?.id) {
      await this?.note?.save()
    }
    if (!this.id) {
      return ApiService.addListItem(this)
        .then(data => BaseService.vuex.commit('updateListItem', {
          listItem: this,
          data: { id: data.id, created: data.created, updated: new Date(data.updated || '') }
        }))
        .catch(error => BaseService.error(error))
    } else {
      return ApiService.updateListItem(this)
        .then(data => BaseService.vuex.commit('updateListItem', { listItem: this, data: { updated: new Date(data.updated || '') } }))
        .catch(error => BaseService.error(error))
    }
  }

  update (data: IListItem) {
    this.updateState(data)
    this.save()
  }

  updateState (data: IListItem) {
    BaseService.vuex.commit('updateListItem', { listItem: this, data })
  }

  removeFromState () {
    BaseService.vuex.commit('removeListItem', this)
  }

  complete (isCompleted: boolean) {
    if (this.text) {
      this.update({ completed: !!isCompleted, order: ListItemsService.generateMaxOrder(this) })
    }
  }

  check (isChecked: boolean) {
    if (this.text) {
      this.update({ checked: !!isChecked })
    }
  }

  remove (addRemovingNote = true) {
    if (this.id) {
      this.hide(addRemovingNote)
      return ApiService.removeListItem(this)
        .catch(error => BaseService.error(error))
    } else {
      return Promise.resolve()
    }
  }

  restore () {
    if (this.id) {
      this.setStatus(StatusesService.getActive())
      return ApiService.restoreListItem(this)
        .catch(error => BaseService.error(error))
    } else {
      return Promise.resolve()
    }
  }

  hide (addRemovingNote = true) {
    this.setStatus(StatusesService.getInActive())
    if (addRemovingNote) {
      BaseService.vuex.commit('addRemovingListItem', this)
    }
  }

  setStatus (status: StatusModel) {
    this.updateState({ statusId: status.id, status })
  }

  clearList () {
    if (this.note?.list) {
      this.note.list = this.note?.list.filter(listItem => listItem.statusId !== StatusesService.getInActive().id)
    }
  }
}
