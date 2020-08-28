import * as types from './mutations-types'
import { RootState } from '~/store'
import CardModel from '~/models/card'

export default {
  [types.CARDS_SET] (state: RootState, cards: Array<CardModel>) {
    state.cards = cards
  },
  [types.CARD_SET] (state: RootState, card: CardModel) {
    state.cards.unshift(card)
  },
  [types.CARD_UNSET] (state: RootState, card: CardModel) {
    state.cards = state.cards.filter((_card: CardModel) => _card.id !== card.id)
  },
  [types.CARD_UPDATED] (state: RootState, card: CardModel) {
    Object.assign(state.cards.find((_card: CardModel) => _card.id === card.id), card)
  },
  [types.SEARCH_QUERY_SET] (state: RootState, searchQuery: string) {
    state.searchQuery = searchQuery
  }
}
