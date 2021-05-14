import * as types from './mutations-types'
import { RootState } from '~/store'
import CardModel from '~/models/card'
import ListItemModel, { ListItemDataObject } from '~/models/list-item'

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
  [types.LIST_ITEM_ADDED] (_state: RootState, listItem: ListItemModel) {
    listItem.card?.list.push(listItem)
  },
  [types.LIST_ITEM_REMOVED] (_state: RootState, listItem: ListItemModel) {
    if (listItem.card?.list) {
      listItem.card.list = listItem?.card?.list.filter(_listItem => _listItem.id !== listItem.id)
    }
  },
  [types.LIST_ITEM_UPDATED] (_state: RootState, { listItem, data }: { listItem: ListItemModel, data: ListItemDataObject }) {
    Object.assign(listItem, data)
  },
  [types.CURRENT_CARD_SET] (state: RootState, currentCard: CardModel) {
    state.currentCard = currentCard
  },
  [types.CARD_UPDATED] (_state: RootState, { card, data }: { card: CardModel, data: any }) {
    Object.assign(card, data)
  },
  [types.SEARCH_QUERY_SET] (state: RootState, searchQuery: string) {
    state.searchQuery = searchQuery
  },
}
