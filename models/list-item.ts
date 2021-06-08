import NoteModel from './note'
import BaseService from '~/services/base'
import ApiService from '~/services/api'
import ListItemsService from '~/services/list-items'

export type Variant = { noteId: number, listItemId: number, text: string, isExists: boolean }

export interface IListItem {
  id?: number
  noteId?: number
  order?: number
  text?: string | ''
  note?: NoteModel | undefined
  focused?: Boolean
  checked?: Boolean
  completed?: Boolean,
  saveTimeout?: ReturnType<typeof setTimeout> | null
  variants?: Variant[]
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
  saveTimeout: ReturnType<typeof setTimeout> | null = null
  variants: Variant[] = []
  created: Date | null = null
  updated: Date | null = null

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
  }

  async save (savingText: boolean = false) {
    await BaseService.vuex.dispatch('clearListItemTimeout', this)
    const saveTimeout = setTimeout(() => {
      if (!this.id) {
        return ApiService.saveListItem(this)
          .then(data => BaseService.vuex.dispatch('updateListItem', {
            listItem: this,
            data: { id: data.id, created: data.created, updated: new Date(data.updated || '') }
          }))
          .catch(error => BaseService.error(error))
      } else {
        return ApiService.updateListItem(this)
          .then(data => BaseService.vuex.dispatch('updateListItem', { listItem: this, data: { updated: new Date(data.updated || '') } }))
          .catch(error => BaseService.error(error))
      }
    }, savingText ? 400 : 0)
    this.updateState({ saveTimeout })
  }

  async update (data: IListItem) {
    await this.updateState(data)
    if (this.text) {
      if (!this?.note?.id) {
        await this?.note?.save()
      }
      this.save(data.text !== undefined)
    } else {
      await BaseService.vuex.dispatch('clearListItemTimeout', this)
    }
  }

  updateState (data: IListItem) {
    return BaseService.vuex.dispatch('updateListItem', { listItem: this, data })
  }

  removeFromState () {
    return BaseService.vuex.dispatch('removeListItem', this)
  }

  complete (isCompleted: boolean) {
    if (this.text) {
      this.update({ completed: !!isCompleted, checked: !!isCompleted, order: ListItemsService.generateMaxOrder(this) })
    }
  }

  check (isChecked: boolean) {
    if (this.text) {
      this.update({ checked: !!isChecked })
    }
  }

  async remove (removeFromState = true) {
    if (this.id) {
      if (removeFromState) {
        await this.removeFromState()
      }
      return ApiService.removeListItem(this)
        .then(() => {
          return this.updateState({ id: undefined })
        })
        .catch(error => BaseService.error(error))
    } else {
      return Promise.resolve()
    }
  }
}
