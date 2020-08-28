import BaseService from './base'
import CardModel from '~/models/card'
import CardDataInterface from '~/interfaces/card'

export default class Card extends BaseService {
  static getCards () {
    return this.api.getCards()
      .then((cardsData: Array<CardDataInterface>) => {
        const cards: Array<CardModel> = []
        cardsData.forEach((cardData: CardDataInterface) => {
          cards.push(new CardModel(cardData.id, cardData.title, cardData.text))
        })
        this.vuex.dispatch('setCards', cards)
      })
  }

  static delete (card: CardModel) {
    this.vuex.dispatch('unsetCard', card)
  }

  static save (card: CardModel, title: string, text: string) {
    this.vuex.dispatch('updateCard', Object.assign({}, card, { title, text }))
  }
}
