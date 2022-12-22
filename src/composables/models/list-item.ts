import { ref, UnwrapRef } from 'vue'
import { type TNoteModel } from '~/composables/models/note'
import { TStatusModel } from '~/composables/models/status'
import StatusesService from '~/composables/services/statuses'
import ApiService from '~/services/api/api'
import BaseService from '~/services/base'

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
  const currentMilliseconds = (new Date()).getMilliseconds()
  const id = ref(listItemData.id)
  const generatedId = ref(`${currentMilliseconds}-${id.value}`)
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
  const isCreating = ref(false)
  const isUpdateNeeded = ref(false)
  let saveTimeout: ReturnType<typeof setTimeout> | undefined

  async function restore() {
    let result
    try {
      if (id.value) {
        statusId.value = StatusesService.active.value.id
        result = await ApiService.restoreListItem(id.value)
      }
      result = Promise.resolve()
    } catch (error) {
      BaseService.showError(error as Error)
    }

    return result
  }

  function generateTextareaRefName() {
    return `textarea-${generatedId.value}`
  }

  function getTextarea() {
    return document.querySelector(`textarea[id="${generateTextareaRefName()}"]`) as HTMLTextAreaElement
  }

  return {
    id,
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
    isUpdateNeeded,
    saveTimeout,
    restore,
    generateTextareaRefName,
    getTextarea,
  }
}

export type TListItemModel = UnwrapRef<ReturnType<typeof listItemModel>>
