import { ActionContext } from 'vuex/types/index'
import * as mutationTypes from './mutations-types'
import { RootState } from '.'
import NoteModel, { INote } from '~/models/note'
import ListItemModel, { IListItem } from '~/models/list-item'
import TypeModel from '~/models/type'
import StatusModel from '~/models/status'
import UserModel from '~/models/user'

export default {
  setSSESalt (actionContext: ActionContext<Function, RootState>, SSESalt: string) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.SSE_SALT_SET, SSESalt)
      resolve('')
    })
  },
  setNotes (actionContext: ActionContext<Function, RootState>, notes: Array<NoteModel>) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.NOTES_SET, notes)
      resolve('')
    })
  },
  setUser (actionContext: ActionContext<Function, RootState>, user: UserModel) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.USER_SET, user)
      resolve('')
    })
  },
  setTypes (actionContext: ActionContext<Function, RootState>, types: TypeModel[]) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.TYPES_SET, types)
      resolve('')
    })
  },
  addNoteCoAuthor (actionContext: ActionContext<Function, RootState>, payload: object) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.NOTE_CO_AUTHOR_ADDED, payload)
      resolve('')
    })
  },
  removeNoteCoAuthor (actionContext: ActionContext<Function, RootState>, payload: object) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.NOTE_CO_AUTHOR_REMOVED, payload)
      resolve('')
    })
  },
  setStatuses (actionContext: ActionContext<Function, RootState>, statuses: StatusModel[]) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.STATUSES_SET, statuses)
      resolve('')
    })
  },
  setMainListScrollTop (actionContext: ActionContext<Function, RootState>, scrollTop: number) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.MAIN_LIST_SCROLL_TOP_SET, scrollTop)
      resolve('')
    })
  },
  setNote (actionContext: ActionContext<Function, RootState>, note: NoteModel) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.NOTE_SET, note)
      resolve('')
    })
  },
  setIsNoteSaving (actionContext: ActionContext<Function, RootState>, isNoteSaving: boolean) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.NOTE_SAVING_SET, isNoteSaving)
      resolve('')
    })
  },
  setIsInitInfoLoading (actionContext: ActionContext<Function, RootState>, isInitInfoLoading: boolean) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.INIT_INFO_LOADING_SET, isInitInfoLoading)
      resolve('')
    })
  },
  updateNote (actionContext: ActionContext<Function, RootState>, payload: INote) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.NOTE_UPDATED, payload)
      resolve('')
    })
  },
  removeListItem (actionContext: ActionContext<Function, RootState>, listItem: ListItemModel) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.LIST_ITEM_REMOVED, listItem)
      resolve('')
    })
  },
  sortNotesByUpdated (actionContext: ActionContext<Function, RootState>, note: NoteModel) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.NOTE_LIST_SORTED_BY_UPDATED, note)
      resolve('')
    })
  },
  addListItem (actionContext: ActionContext<Function, RootState>, listItem: ListItemModel) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.LIST_ITEM_ADDED, listItem)
      resolve('')
    })
  },
  updateListItem (actionContext: ActionContext<Function, RootState>, payload: IListItem) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.LIST_ITEM_UPDATED, payload)
      resolve('')
    })
  },
  clearNoteTimeout (actionContext: ActionContext<Function, RootState>, note: NoteModel) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.NOTE_TIMEOUT_CLEARED, note)
      resolve('')
    })
  },
  unsetNote (actionContext: ActionContext<Function, RootState>, note: NoteModel) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.NOTE_UNSET, note)
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
