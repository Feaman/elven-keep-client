import mutations from './mutations'
import actions from './actions'
import CardModel from '~/models/card'

export const state = () => {
  return {
    cards: [] as Array<CardModel>,
    currentCard: null as CardModel | null,
    searchQuery: '',
  }
}

export type RootState = ReturnType<typeof state>

export default {
  namespaced: true,
  mutations,
  state,
  actions
}
