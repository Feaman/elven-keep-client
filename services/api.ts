import BaseService from './base'
import CardModel, { CardDataObject } from '~/models/card'
import ListItemModel, { ListItemDataObject } from '~/models/list-item'

const cards: Array<CardDataObject> = []
for (let i = 1; i < 10; i++) {
  cards.push({
    id: i,
    title: 'Title one',
    text: 'The only little one the text of glorThe only little one the text of glorThe only little one the text of gloryyy',
    list: [
      new ListItemModel({ id: 1, text: '1asdf asdf asdfas df adsf asd fsdaf' }),
      new ListItemModel({ id: 2, text: '2asdf asdf asdfas df adsf asd fsdaf' }),
      new ListItemModel({ id: 3, text: '3asdf asdf asdfas df adsf asd fsdaf' }),
      new ListItemModel({ id: 4, text: '4asdf asdf asdfas df adsf asd fsdaf' }),
      new ListItemModel({ id: 5, text: '5asdf asdf asdfas df adsf asd fsdaf' }),
      new ListItemModel({ id: 6, text: '6asdf asdf asdfas df adsf asd fsdaf' }),
    ],
  })
}

export default class ApiService extends BaseService {
  static getCards (): Promise<Array<CardDataObject>> {
    return new Promise((resolve) => {
      resolve(cards)
    })
  }

  static addCard (card: CardModel): Promise<CardDataObject> {
    console.log('card added', card)
    return new Promise((resolve) => {
      resolve({
        id: this.vuex.state.cards.length + 1,
      })
    })
  }

  static saveListItem (listItem: ListItemModel): Promise<ListItemDataObject> {
    console.log('list item saved', listItem)
    return new Promise((resolve) => {
      resolve({
        id: (listItem?.card?.list?.length || -10000) + 1,
      })
    })
  }

  static removeListItem (listItem: ListItemModel) {
    console.log('list item removed', listItem)
    return new Promise((resolve) => {
      resolve('')
    })
  }

  static removeCard (card: CardModel) {
    console.log('card removed', card)
    return new Promise((resolve) => {
      resolve('')
    })
  }
}
