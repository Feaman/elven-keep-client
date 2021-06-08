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
}
