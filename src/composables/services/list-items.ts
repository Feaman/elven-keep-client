import { ref, unref } from 'vue'
import listItemModel, { TListItemModel } from '~/composables/models/list-item'
import { type TNoteModel } from '~/composables/models/note'
import StatusesService from '~/composables/services/statuses'

const removingListItems = ref<TListItemModel[]>([])

function handleListItemTextAreaHeight($textArea: HTMLTextAreaElement | undefined) {
  if ($textArea) {
    let textAreaHeight = 0
    const $parent = $textArea.parentElement
    $parent?.classList.remove('list-item__text--multi-line')
    const $clone: HTMLTextAreaElement = $textArea.cloneNode() as HTMLTextAreaElement
    $clone.classList.remove('transition')
    $clone.style.height = '0'
    $parent?.appendChild($clone)
    textAreaHeight = $clone.scrollHeight
    $clone.remove()
    $textArea.style.height = `${textAreaHeight}px`
    $textArea.style.minHeight = `${textAreaHeight}px`

    if (textAreaHeight > 64) {
      $parent?.classList.add('list-item__text--multi-line')
    }
  }
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
  return unref(listItemModel(
    {
      updated: String(new Date()),
      statusId: StatusesService.active.value.id,
      text: '',
    },
  ))
}

export default {
  removingListItems,
  handleTextAreaHeights,
  handleListItemTextAreaHeight,
  filterCompleted,
  createListItem,
}
