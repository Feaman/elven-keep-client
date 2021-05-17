import { AxiosResponse } from 'axios'
import BaseService from './base'
import CardModel, { CardDataObject } from '~/models/card'
import ListItemModel, { ListItemDataObject } from '~/models/list-item'
import { TypeDataObject } from '~/models/type'

export default class ApiService extends BaseService {
  static URL = 'http://api.notes.pavlo.ru/'

  static init () {
    this.axios.setBaseURL(this.URL)
  }

  static getCards (): Promise<CardDataObject[]> {
    return this.axios.get('cards')
      .then((response: AxiosResponse) => {
        response.data.forEach((card: any) => {
          card.typeId = card.type_id
          card.isCompletedListExpanded = card.is_completed_list_expanded
        })
        return response.data
      })
  }

  static getTypes (): Promise<TypeDataObject[]> {
    return this.axios.get('card-types')
      .then((response: AxiosResponse) => {
        return response.data
      })
  }

  static addCard (card: CardModel): Promise<CardDataObject> {
    return this.axios.post('cards', card)
      .then((response: AxiosResponse) => {
        return response.data
      })
      .catch(error => this.error(error))
  }

  static updateCard (card: CardModel): Promise<CardDataObject> {
    return this.axios.put(`cards/${card.id}`, card)
      .then((response: AxiosResponse) => {
        return response.data
      })
      .catch(error => this.error(error))
  }

  static saveListItem (listItem: ListItemModel): Promise<ListItemDataObject> {
    return this.axios.post('list-item', { data: listItem })
      .then((response: AxiosResponse) => {
        return response.data
      })
  }

  static removeListItem (listItem: ListItemModel) {
    return this.axios.delete('list-item', { data: listItem })
      .then((response: AxiosResponse) => {
        return response.data
      })
  }

  static removeCard (card: CardModel) {
    return this.axios.delete('cards', { data: card })
      .then((response: AxiosResponse) => {
        return response.data
      })
  }
}
