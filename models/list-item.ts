import NoteModel from './note'
import BaseService from '~/services/base'
import ApiService from '~/services/api'

export interface ListItemDataObject {
  id?: number
  noteId?: number
  text?: string | ''
  note?: NoteModel | undefined
  focused?: Boolean
  checked?: Boolean
  completed?: Boolean,
  saveTimeout?: ReturnType<typeof setTimeout> | null
  variants?: string[]
}

export default class ListItemModel {
  id?: number
  _id: string
  text?: string | ''
  note: NoteModel | undefined
  focused: Boolean
  checked: Boolean
  completed: Boolean
  saveTimeout: ReturnType<typeof setTimeout> | null = null
  variants: string[] = []

  constructor (data: ListItemDataObject) {
    this.id = data?.id
    this._id = `${(new Date()).getMilliseconds()}-${this.id}`
    this.text = data?.text
    this.note = data?.note
    this.focused = data.focused || false
    this.checked = data.checked || false
    this.completed = data.completed || false
  }

  async save (savingText: boolean = false) {
    await BaseService.vuex.dispatch('clearListItemTimeout', this)
    const saveTimeout = setTimeout(() => {
      if (!this.id) {
        return ApiService.saveListItem(this)
          .then(data => BaseService.vuex.dispatch('updateListItem', { listItem: this, data: { id: data.id } }))
          .catch(error => BaseService.error(error))
      } else {
        return ApiService.updateListItem(this)
          .catch(error => BaseService.error(error))
      }
    }, savingText ? 400 : 0)
    this.updateState({ saveTimeout })
  }

  async update (data: ListItemDataObject) {
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

  updateState (data: ListItemDataObject) {
    return BaseService.vuex.dispatch('updateListItem', { listItem: this, data })
  }

  removeFromState () {
    return BaseService.vuex.dispatch('removeListItem', this)
  }

  complete (isCompleted: boolean) {
    if (this.text) {
      this.update({ completed: !!isCompleted })
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
        .then(() => this.updateState({ id: undefined }))
        .catch(error => BaseService.error(error))
    } else {
      return Promise.resolve()
    }
  }
}
