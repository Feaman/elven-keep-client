import BaseService from './base'
import CardDataInterface from '~/interfaces/card'

const cards: Array<CardDataInterface> = []
for (let i = 0; i < 10; i++) {
  cards.push({
    id: i,
    title: 'Title one',
    text: 'The only little one the text of glorThe only little one the text of glorThe only little one the text of gloryyy'
  })
}

export default class Api extends BaseService {
  static getCards (): Promise<Array<CardDataInterface>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(cards)
      }, 1000)
    })
  }
}
