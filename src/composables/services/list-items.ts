import { TListItemModel } from '~/composables/models/list-item'
import { type TNoteModel } from '~/composables/models/note'
import StatusesService from '~/composables/services/statuses'

function handleListItemTextAreaHeight($textArea: HTMLTextAreaElement) {
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

export default {
  handleTextAreaHeights,
  handleListItemTextAreaHeight,
  filterCompleted,
}
