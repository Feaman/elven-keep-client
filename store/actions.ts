import * as types from './mutations-types'
import CardModel from '~/models/card'

export default {
  setCards ({ commit }, cards: Array<CardModel>) {
    return new Promise(function (resolve) {
      commit(types.CARDS_SET, cards)
      resolve()
    })
  },
  setCard ({ commit }, card: CardModel) {
    return new Promise(function (resolve) {
      commit(types.CARD_SET, card)
      resolve()
    })
  },
  updateCard ({ commit }, card: CardModel) {
    return new Promise(function (resolve) {
      commit(types.CARD_UPDATED, card)
      resolve()
    })
  },
  unsetCard ({ commit }, card: CardModel) {
    return new Promise(function (resolve) {
      commit(types.CARD_UNSET, card)
      resolve()
    })
  },
  setQuerySearch ({ commit }, querySearch: string) {
    return new Promise(function (resolve) {
      commit(types.SEARCH_QUERY_SET, querySearch)
      resolve()
    })
  }
}
