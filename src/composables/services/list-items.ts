import { TListItemModel } from '~/composables/models/list-item'
import { type TNoteModel } from '~/composables/models/note'
import StatusesService from '~/composables/services/statuses'
import NotesService from '~/composables/services/notes'

function generateMaxOrder(listItemId: number, noteId: number) {
  let order = 0
  const note = NotesService.find(Number(noteId))
  if (note.list.length) {
    const numbers = note.list
      .filter((_listItem) => _listItem.id !== listItemId)
      .map((listItem) => listItem.order)
    order = Math.max(...numbers)
  }

  return order + 1
}

function filterAndSort(list: TListItemModel[], completed = false) {
  return list
    .filter((listItem) => (completed ? listItem.completed : !listItem.completed) && listItem.statusId === StatusesService.active.value.id)
    .sort((previousItem, nextItem) => ((previousItem.order || 0) < (nextItem.order || 0) ? -1 : 1))
    .sort((previousItem, nextItem) => {
      if (previousItem.checked === nextItem.checked) {
        return 0
      }
      return previousItem.checked ? 1 : -1
    })
}

function getListItemTextarea(list: TListItemModel[], listItem: TListItemModel, refs: { [key: string]: HTMLTextAreaElement[] }) {
  const textareaComponents = refs[`textarea-${listItem.id || list.indexOf(listItem)}`] as HTMLTextAreaElement[]
  if (textareaComponents?.length) {
    return textareaComponents[0]
  }
  return null
}

function handleListItemTextAreaHeight(list: TListItemModel[], listItem: TListItemModel, refs: { [key: string]: HTMLTextAreaElement[] }) {
  const $textArea = getListItemTextarea(list, listItem, refs)
  let textAreaHeight = 0
  if (!$textArea) {
    throw new Error('Text area not found')
  }

  const $parent = $textArea.parentElement
  $parent?.classList.remove('list-item__text--multi-line')
  $textArea.style.height = '0'
  textAreaHeight = $textArea.scrollHeight
  $textArea.style.height = `${textAreaHeight}px`

  if (textAreaHeight > 62) {
    $parent?.classList.add('list-item__text--multi-line')
  }

  return $textArea
}

function handleTextAreaHeights(list: TListItemModel[], refs: { [key: string]: HTMLTextAreaElement[] }) {
  list.forEach((listItem) => {
    handleListItemTextAreaHeight(list, listItem, refs)
  })
}

function filterCompleted(note: TNoteModel) {
  return note.list.filter((listItem) => listItem.completed && listItem.statusId === StatusesService.active.value.id)
}

// function isGradient(note: TNoteModel) {
// return note.type?.name === TypeModel.TYPE_LIST
// && mainListItems.length > 7 + (note.title ? 0 : 1) + (completedListItems.length ? -1 : 0)
// }

export default {
  generateMaxOrder,
  filterAndSort,
  getListItemTextarea,
  handleTextAreaHeights,
  handleListItemTextAreaHeight,
  filterCompleted,
  // isGradient,
}
