import NoteModel from './note'
import BaseService from '~/services/base'
import ApiService from '~/services/api'
import ListItemsService from '~/services/list-items'

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
  completed?: Boolean,
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

  save () {
    if (!this.id) {
      return ApiService.saveListItem(this)
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

  async update (data: IListItem) {
    this.updateState(data)
    if (this.text) {
      if (!this?.note?.id) {
        await this?.note?.save()
      }
      this.save()
    }
  }

  updateState (data: IListItem) {
    BaseService.vuex.commit('updateListItem', { listItem: this, data })
  }

  removeFromState () {
    BaseService.vuex.commit('removeListItem', this)
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

  remove (removeFromState = true) {
    if (this.id) {
      if (removeFromState) {
        this.removeFromState()
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

  selectVariant (variant: Variant) {
    if (variant.noteId === this.noteId && variant.listItemId !== this.id) {
      const existentListItem = this.note?.list.find((listItem: ListItemModel) => listItem.id === variant.listItemId)
      if (existentListItem) {
        existentListItem.update({ completed: false, checked: false, order: ListItemsService.generateMaxOrder(this) })
        this.remove()
      }
    } else {
      this.update({ text: variant.text })
    }
  }

  selectFocusedVariant () {
    const focusedVariant = this.variants.find(variant => variant.focused)
    if (focusedVariant) {
      this.selectVariant(focusedVariant)
      setTimeout(() => this.update({ text: this.text?.trim() }), 400)
    }
  }

  focusVariant (direction: string) {
    const focusedVariant = this.variants.find(variant => variant.focused)
    const variants = this.variants.map(variant => Object.assign({}, variant, { focused: false }))
    if (variants.length) {
      let currentIndex = direction === 'down' ? 0 : variants.length - 1
      if (focusedVariant) {
        const adding = (direction === 'down' ? 1 : -1)
        const currentVariantIndex = this.variants.indexOf(focusedVariant)
        currentIndex = currentVariantIndex + adding
        if (currentIndex < 0) {
          currentIndex = variants.length - 1
        } else if (currentIndex > this.variants.length - 1) {
          currentIndex = 0
        }
      }
      variants[currentIndex].focused = true
      this.updateState({ variants })
    }
  }
}
