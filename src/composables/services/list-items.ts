import { ref } from 'vue'
import listItemModel, { TListItemModel } from '~/composables/models/list-item'
import { type TNoteModel } from '~/composables/models/note'
import StatusesService from '~/composables/services/statuses'
import KeyboardEvents from '~/helpers/keyboard-events'
import SwipeEvents from '~/helpers/swipe-events'

const removingListItems = ref<TListItemModel[]>([])
const listItemMinHeight = 36
const variantsListItemMinHeight = 34

function handleListItemTextAreaHeight($textArea: HTMLTextAreaElement) {
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

function handleTextAreaHeights($container: HTMLDivElement) {
  Array.from($container.querySelectorAll('textarea[id]')).forEach(($textarea) => {
    handleListItemTextAreaHeight($textarea as HTMLTextAreaElement)
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

function addTextareaKeydownEvent($textarea: HTMLTextAreaElement, callback: (event: KeyboardEvent) => void) {
  $textarea.onkeydown = (event: KeyboardEvent) => {
    if (KeyboardEvents.is(event, KeyboardEvents.ENTER, false, true)) {
      callback(event)
    }
    if (KeyboardEvents.is(event, KeyboardEvents.ENTER, false, false, true)) {
      callback(event)
    }
  }
}

function calculateVariantsMenuYPosition(yPosition: number, menuHeight: number) {
  const headerHeight = 50
  const offset = 8
  if (yPosition - headerHeight > menuHeight) {
    return yPosition - menuHeight
  }
  return headerHeight + offset
}

function addTextareaSwipeEvent(note: TNoteModel, listItem: TListItemModel) {
  const $textarea = listItem.getTextarea()
  const swiper = new SwipeEvents($textarea)
  swiper.onMove = (xDiff: number) => {
    if (!listItem.checked && xDiff > 0) {
      if (xDiff >= 30) {
        $textarea.classList.add('text-strike')
      } else {
        $textarea.style.opacity = `${10 / xDiff}`
        $textarea.classList.remove('text-strike')
      }
    }
    if (listItem.checked && xDiff < 0) {
      if (xDiff <= -30) {
        $textarea.classList.add('text-decoration-none')
        $textarea.classList.add('text-black')
      } else {
        $textarea.classList.remove('text-decoration-none')
        $textarea.classList.remove('text-black')
      }
    }
  }
  swiper.onEnd = (xDiff: number) => {
    if (!listItem.checked) {
      $textarea.style.opacity = '1'
      $textarea.classList.remove('text-strike')
      if (xDiff > 30) {
        note.checkOrUncheckListItem(listItem, true)
      }
    } else if (xDiff < -30) {
      $textarea.classList.remove('text-decoration-none')
      $textarea.classList.remove('text-black')
      note.checkOrUncheckListItem(listItem, false)
    }
  }
}

function generateMaxOrder(listItemId: number, list: TListItemModel[]) {
  let order = 0
  if (list.length) {
    const numbers = list
      .filter((_listItem) => _listItem.id !== listItemId)
      .map((listItem) => listItem.order)
    order = Math.max(...numbers)
  }

  return order + 1
}

export default {
  listItemMinHeight,
  removingListItems,
  variantsListItemMinHeight,
  generateMaxOrder,
  addTextareaSwipeEvent,
  calculateVariantsMenuYPosition,
  handleTextAreaHeights,
  handleListItemTextAreaHeight,
  filterCompleted,
  createListItem,
  addTextareaKeydownEvent,
}
