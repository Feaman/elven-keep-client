import { ref, UnwrapRef } from 'vue'
import { type TNoteModel } from '~/composables/models/note'
import { TStatusModel } from '~/composables/models/status'
import StatusesService from '~/composables/services/statuses'
import ListItemsService from '../services/list-items'

export type Variant = {
  noteId: number,
  listItemId: number,
  text: string,
  highlightedText: string,
  isExists: boolean,
  focused: boolean,
  duplicatesQuantity?: number,
}

export interface IListItem {
  id?: number
  noteId?: number
  order?: number
  text?: string | ''
  note?: TNoteModel | undefined
  focused?: boolean
  checked?: boolean
  completed?: boolean
  statusId?: number
  status?: TStatusModel
  created?: string
  updated?: string
}

export default function listItemModel(listItemData: IListItem) {
  const id = ref(listItemData.id)
  const uniqueId = ref(`${(new Date()).getMilliseconds()}-${id.value}`)
  const text = ref(listItemData.text || '')
  const noteId = ref(listItemData.noteId)
  const order = ref(listItemData.order || 0)
  const focused = ref(listItemData.focused || false)
  const checked = ref(!!listItemData.checked || false)
  const completed = ref(listItemData.completed || false)
  const created = ref(listItemData.created ? new Date(listItemData.created) : null)
  const updated = ref(listItemData.updated ? new Date(listItemData.updated) : null)
  const statusId = ref(listItemData.statusId || StatusesService.active.value.id)
  const status = ref(StatusesService.findById(statusId.value))

  // async function save() {
  //   if (!this?.note?.id) {
  //     await this?.note?.save()
  //   }
  //   if (!this.id) {
  //     return ApiService.addListItem(this)
  //       .then((data) => BaseService.vuex.commit('updateListItem', {
  //         listItem: this,
  //         data: { id: data.id, created: data.created, updated: new Date(data.updated || '') },
  //       }))
  //       .catch((error) => BaseService.error(error))
  //   }
  //   return ApiService.updateListItem(this)
  //     .then((data) => BaseService.vuex.commit('updateListItem', { listItem: this, data: { updated: new Date(data.updated || '') } }))
  //     .catch((error) => BaseService.error(error))
  // }

  // update(data: IListItem) {
  //   this.updateState(data)
  //   this.save()
  // }

  // updateState(data: IListItem) {
  //   BaseService.vuex.commit('updateListItem', { listItem: this, data })
  // }

  // removeFromState() {
  //   BaseService.vuex.commit('removeListItem', this)
  // }

  function complete(isCompleted: boolean) {
    completed.value = isCompleted
    order.value = ListItemsService.generateMaxOrder(Number(id.value), noteId.value)
    // save()
  }

  // check(isChecked: boolean) {
  //   this.update({ checked: isChecked })
  // }

  // remove(addRemovingNote = true) {
  //   if (this.id) {
  //     this.hide(addRemovingNote)
  //     return ApiService.removeListItem(this)
  //       .catch((error) => BaseService.error(error))
  //   }
  //   return Promise.resolve()
  // }

  // restore() {
  //   if (this.id) {
  //     this.setStatus(StatusesService.getActive())
  //     return ApiService.restoreListItem(this)
  //       .catch((error) => BaseService.error(error))
  //   }
  //   return Promise.resolve()
  // }

  // hide(addRemovingNote = true) {
  //   this.setStatus(StatusesService.getInActive())
  //   if (addRemovingNote) {
  //     BaseService.vuex.commit('addRemovingListItem', this)
  //   }
  // }

  // setStatus(status: StatusModel) {
  //   this.updateState({ statusId: status.id, status })
  // }

  // clearList() {
  //   if (this.note?.list) {
  //     this.note.list = this.note?.list.filter((listItem) => listItem.statusId !== StatusesService.getInActive().id)
  //   }
  // }

  // selectVariant(variant: Variant) {
  //   if (variant.noteId === this.noteId && variant.listItemId !== this.id) {
  //     const existentListItem = this.note?.list.find((listItem: ListItemModel) => listItem.id === variant.listItemId)
  //     if (existentListItem) {
  //       existentListItem.update({ completed: this.completed, checked: this.checked, order: this.order })
  //       this.remove(false)
  //     }
  //   } else {
  //     this.update({ text: variant.text })
  //   }
  // }

  return {
    id, uniqueId, text, noteId, order, focused, checked, completed, created, updated, statusId, status, complete,
  }
}

export type TListItemModel = UnwrapRef<ReturnType<typeof listItemModel>>
