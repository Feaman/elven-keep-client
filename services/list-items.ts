import StatusesService from './statuses'
import ListItemModel from '~/models/list-item'
import BaseService from '~/services/base'

export default class ListItemsService extends BaseService {
  static generateMaxOrder (listItem: ListItemModel) {
    let order = 0
    if (listItem.note?.list.length) {
      order = Math.max.apply(
        Math,
        listItem.note.list.filter(_listItem => _listItem.id !== listItem.id).map(listItem => listItem.order)
      )
    }

    return order + 1
  }

  static filterAndSort (list: ListItemModel[], completed = false) {
    return list
      .filter(listItem => (completed ? listItem.completed : !listItem.completed) && listItem.statusId === StatusesService.getActive().id)
      .sort((previousItem, nextItem) => (previousItem.order || 0) < (nextItem.order || 0) ? -1 : 1)
      .sort((previousItem, nextItem) => {
        if (previousItem.checked === nextItem.checked) {
          return 0
        }
        return previousItem.checked ? 1 : -1
      })
  }

  static handleTextAreaHeights (list: ListItemModel[], refs: { [key: string]: HTMLTextAreaElement[] }) {
    list.forEach(listItem => {
      this.handleListItemTextAreaHeight(list, listItem, refs)
    })
  }

  static handleListItemTextAreaHeight (list: ListItemModel[], listItem: ListItemModel, refs: { [key: string]: HTMLTextAreaElement[] }) {
    const $textArea = this.getListItemTextarea(list, listItem, refs)
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

  static getListItemTextarea (list: ListItemModel[], listItem: ListItemModel, refs: { [key: string]: HTMLTextAreaElement[] }) {
    const textareaComponents = refs[`textarea-${listItem.id || list.indexOf(listItem)}`] as HTMLTextAreaElement[]
    if (textareaComponents?.length) {
      return textareaComponents[0]
    }
    return null
  }
}
