import mutations from './mutations'
import actions from './actions'
import NoteModel from '~/models/note'
import TypeModel from '~/models/type'
import StatusModel from '~/models/status'

export const state = () => {
  return {
    notes: [] as NoteModel[],
    types: [] as TypeModel[],
    statuses: [] as StatusModel[],
    currentNote: null as NoteModel | null,
    searchQuery: '',
    isNoteSaving: false,
    isInitInfoLoading: true,
  }
}

export type RootState = ReturnType<typeof state>

export default {
  namespaced: true,
  mutations,
  state,
  actions
}
