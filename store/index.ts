import mutations from './mutations'
import actions from './actions'
import CardModel from '~/models/card'
import TypeModel from '~/models/type'

export const state = () => {
  return {
    cards: [] as CardModel[],
    types: [] as TypeModel[],
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
