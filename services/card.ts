import BaseService from '~/services/base'
import CardModel, { CardDataObject } from '~/models/card'

export default class CardService extends BaseService {
  static getCards () {
    return this.api.getCards()
      .then((cardsData: Array<CardDataObject>) => {
        const cards: Array<CardModel> = []
        cardsData.forEach((cardData: CardDataObject) => {
          const card = new CardModel(cardData)
          card.setCardToListItems()
          cards.push(card)
        })
        this.vuex.dispatch('setCards', cards)
      })
      .catch(error => this.error(error))
  }
}
