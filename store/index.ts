import mutations from './mutations'
import NoteModel from '~/models/note'
import TypeModel from '~/models/type'
import ListItemModel from '~/models/list-item'
import StatusModel from '~/models/status'
import UserModel from '~/models/user'

export const state = () => {
  return {
    notes: [] as NoteModel[],
    types: [] as TypeModel[],
    statuses: [] as StatusModel[],
    mainListScrollTop: 0,
    user: null as UserModel | null,
    SSESalt: '',
    searchQuery: '',
    isNoteSaving: false,
    isInitInfoLoading: true,
    removingEntities: {
      notes: {
        timer: null as ReturnType<typeof setTimeout> | null,
        items: [] as NoteModel[],
      },
      listItems: {
        timer: null as ReturnType<typeof setTimeout> | null,
        items: [] as ListItemModel[],
      }
    }
  }
}

export type RootState = ReturnType<typeof state>

export default {
  namespaced: true,
  mutations,
  state,
}
