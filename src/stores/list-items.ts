import { defineStore } from 'pinia'
import ListItemModel from '~/models/list-item'
import { NoteModel } from './note'
import { useStatusesStore } from './statuses'

export const useListItemsStore = defineStore('listItems', () => {
  const statusesStore = useStatusesStore()

  function generateMaxOrder(listItem: ListItemModel) {
    console.log(listItem)
    // let order = 0
    // if (listItem.note?.list.length) {
    // order = Math.max.apply(
    //   Math,
    //   listItem.note.list.filter((_listItem) => _listItem.id !== listItem.id).map((listItem) => listItem.order),
    // )
    // }

    // return order + 1
  }

  function filterAndSort(list: ListItemModel[], completed = false) {
    return list
      .filter((listItem) => (completed ? listItem.completed : !listItem.completed) && listItem.statusId === statusesStore.getActive().id)
      .sort((previousItem, nextItem) => ((previousItem.order || 0) < (nextItem.order || 0) ? -1 : 1))
      .sort((previousItem, nextItem) => {
        if (previousItem.checked === nextItem.checked) {
          return 0
        }
        return previousItem.checked ? 1 : -1
      })
  }

  function getListItemTextarea(list: ListItemModel[], listItem: ListItemModel, refs: { [key: string]: HTMLTextAreaElement[] }) {
    const textareaComponents = refs[`textarea-${listItem.id || list.indexOf(listItem)}`] as HTMLTextAreaElement[]
    if (textareaComponents?.length) {
      return textareaComponents[0]
    }
    return null
  }

  function handleListItemTextAreaHeight(list: ListItemModel[], listItem: ListItemModel, refs: { [key: string]: HTMLTextAreaElement[] }) {
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

  function handleTextAreaHeights(list: ListItemModel[], refs: { [key: string]: HTMLTextAreaElement[] }) {
    list.forEach((listItem) => {
      handleListItemTextAreaHeight(list, listItem, refs)
    })
  }

  function filterCompleted(note: NoteModel) {
    return note.list.filter((listItem) => listItem.completed && listItem.statusId === statusesStore.getActive().id)
  }

  // function isGradient(note: NoteModel) {
  // return note.type?.name === TypeModel.TYPE_LIST
  // && mainListItems.length > 7 + (note.title ? 0 : 1) + (completedListItems.length ? -1 : 0)
  // }

  return {
    generateMaxOrder,
    filterAndSort,
    getListItemTextarea,
    handleTextAreaHeights,
    handleListItemTextAreaHeight,
    filterCompleted,
    // isGradient,
  }
})
