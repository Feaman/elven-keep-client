import listItemModel, { TListItemModel } from '~/composables/models/list-item'
import { type TNoteModel } from '~/composables/models/note'
import StatusesService from '~/composables/services/statuses'

function handleListItemTextAreaHeight($textArea: HTMLTextAreaElement) {
  let textAreaHeight = 0
  const $parent = $textArea.parentElement
  $parent?.classList.remove('list-item__text--multi-line')
  $textArea.style.height = '0'
  textAreaHeight = $textArea.scrollHeight
  $textArea.style.height = `${textAreaHeight}px`

  if (textAreaHeight > 64) {
    $parent?.classList.add('list-item__text--multi-line')
  }

  return $textArea
}

function handleTextAreaHeights(list: TListItemModel[]) {
  list.forEach((listItem) => {
    handleListItemTextAreaHeight(listItem.$textarea)
  })
}

function filterCompleted(note: TNoteModel) {
  return note.list.filter((listItem) => listItem.completed && listItem.statusId === StatusesService.active.value.id)
}

function createListItem() {
  return listItemModel(
    {
      updated: String(new Date()),
      statusId: StatusesService.active.value.id,
      text: '',
    },
  )
}

export default {
  handleTextAreaHeights,
  handleListItemTextAreaHeight,
  filterCompleted,
  createListItem,
}
