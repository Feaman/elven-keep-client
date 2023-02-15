import { nextTick, ref, UnwrapRef, watch } from 'vue'
import { type TNoteModel } from '~/composables/models/note'
import { TStatusModel } from '~/composables/models/status'
import StatusesService from '~/composables/services/statuses'
import ApiService from '~/services/api/api'
import BaseService from '~/services/base'
import ListItemsService from '../services/list-items'
import NotesService from '../services/notes'

const LAST_TEXTAREA = 'LAST_TEXTAREA'
const FIRST_TEXTAREA = 'FIRST_TEXTAREA'

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
  const focused = ref(false)
  const checked = ref(!!listItemData.checked || false)
  const completed = ref(!!listItemData.completed || false)
  const created = ref(listItemData.created ? new Date(listItemData.created) : null)
  const updated = ref(listItemData.updated ? new Date(listItemData.updated) : null)
  const statusId = ref(listItemData.statusId || StatusesService.active.value.id)
  const isCreating = ref(false)
  const isUpdateNeeded = ref(false)
  let saveTimeout: ReturnType<typeof setTimeout> | undefined

  async function restore() {
    try {
      if (id.value) {
        statusId.value = StatusesService.active.value.id
        await ApiService.restoreListItem(id.value)
      }
    } catch (error) {
      BaseService.showError(error as Error)
    }
  }

  function generateTextareaRefName() {
    return `textarea-${generatedId.value}`
  }

  function getTextarea(which = LAST_TEXTAREA) {
    const textAreas = document.querySelectorAll(`textarea[id="${generateTextareaRefName()}"]`)
    return textAreas[which === FIRST_TEXTAREA ? 0 : textAreas.length - 1] as HTMLTextAreaElement
  }

  function handleDataTransformation() {
    created.value = created.value ? new Date(created.value) : new Date()
    updated.value = updated.value ? new Date(updated.value) : new Date()
  }

  async function updateTextArea(which = LAST_TEXTAREA) {
    await nextTick()
    const $textArea = getTextarea(which)
    if ($textArea) {
      ListItemsService.handleListItemTextAreaHeight($textArea)
      if (!completed.value && id.value && noteId.value) {
        const note = NotesService.find(noteId.value)
        ListItemsService.addTextareaSwipeEvent(note, note.findListItem(id.value), FIRST_TEXTAREA)
      }
    }
  }

  watch(text, () => updateTextArea())
  watch(completed, () => updateTextArea(completed.value ? LAST_TEXTAREA : FIRST_TEXTAREA))

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
    isCreating,
    isUpdateNeeded,
    saveTimeout,
    handleDataTransformation,
    restore,
    generateTextareaRefName,
    getTextarea,
  }
}

export type TListItemModel = UnwrapRef<ReturnType<typeof listItemModel>>
