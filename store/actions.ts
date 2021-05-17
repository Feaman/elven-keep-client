import { ActionContext } from 'vuex/types/index'
import * as mutationTypes from './mutations-types'
import { RootState } from '.'
import CardModel from '~/models/card'
import ListItemModel from '~/models/list-item'
import TypeModel from '~/models/type'

export default {
  setCards (actionContext: ActionContext<Function, RootState>, cards: Array<CardModel>) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.CARDS_SET, cards)
      resolve('')
    })
  },
  setTypes (actionContext: ActionContext<Function, RootState>, types: TypeModel[]) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.TYPES_SET, types)
      resolve('')
    })
  },
  setCard (actionContext: ActionContext<Function, RootState>, card: CardModel) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.CARD_SET, card)
      resolve('')
    })
  },
  updateCard (actionContext: ActionContext<Function, RootState>, payload: any) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.CARD_UPDATED, payload)
      resolve('')
    })
  },
  removeListItem (actionContext: ActionContext<Function, RootState>, listItem: ListItemModel) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.LIST_ITEM_REMOVED, listItem)
      resolve('')
    })
  },
  addListItem (actionContext: ActionContext<Function, RootState>, listItem: ListItemModel) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.LIST_ITEM_ADDED, listItem)
      resolve('')
    })
  },
  updateListItem (actionContext: ActionContext<Function, RootState>, payload: any) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.LIST_ITEM_UPDATED, payload)
      resolve('')
    })
  },
  setCurrentCard (actionContext: ActionContext<Function, RootState>, currentCard: CardModel) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.CURRENT_CARD_SET, currentCard)
      resolve('')
    })
  },
  unsetCard (actionContext: ActionContext<Function, RootState>, card: CardModel) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.CARD_UNSET, card)
      resolve('')
    })
  },
  setQuerySearch (actionContext: ActionContext<Function, RootState>, querySearch: string) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.SEARCH_QUERY_SET, querySearch)
      resolve('')
    })
  },
}
