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
}
