import { ref, UnwrapRef } from 'vue'
import { type TNoteModel } from '~/composables/models/note'
import { TStatusModel } from '~/composables/models/status'
import StatusesService from '~/composables/services/statuses'

export type TVariant = {
  noteId: number,
  listItemId: number,
  text: string,
  highlightedText: string,
  isExists: boolean,
  focused: boolean,
  duplicatesQuantity?: number,
}

export type TListItem = {
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

export default function listItemModel(listItemData: TListItem) {
  const id = ref(listItemData.id)
  const generatedId = `${(new Date()).getMilliseconds()}-${id.value}`
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
  const $textarea: HTMLTextAreaElement = document.createElement('textarea')
  const isCreating = ref(false)

  // restore() {
  //   if (this.id) {
  //     this.setStatus(StatusesService.getActive())
  //     return ApiService.restoreListItem(this)
  //       .catch((error) => BaseService.error(error))
  //   }
  //   return Promise.resolve()
  // }

  // clearList() {
  //   if (this.note?.list) {
  //     this.note.list = this.note?.list.filter((listItem) => listItem.statusId !== StatusesService.getInActive().id)
  //   }
  // }

  return {
    id,
    $textarea,
    generatedId,
    text,
    noteId,
    order,
    focused,
    checked,
    completed,
    created,
    updated,
    statusId,
    status,
    isCreating,
  }
}

export type TListItemModel = UnwrapRef<ReturnType<typeof listItemModel>>
