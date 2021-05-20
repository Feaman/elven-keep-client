import { ActionContext } from 'vuex/types/index'
import * as mutationTypes from './mutations-types'
import { RootState } from '.'
import NoteModel from '~/models/note'
import ListItemModel from '~/models/list-item'
import TypeModel from '~/models/type'
import StatusModel from '~/models/status'

export default {
  setNotes (actionContext: ActionContext<Function, RootState>, notes: Array<NoteModel>) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.NOTES_SET, notes)
      resolve('')
    })
  },
  setTypes (actionContext: ActionContext<Function, RootState>, types: TypeModel[]) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.TYPES_SET, types)
      resolve('')
    })
  },
  setStatuses (actionContext: ActionContext<Function, RootState>, statuses: StatusModel[]) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.STATUSES_SET, statuses)
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
  updateNote (actionContext: ActionContext<Function, RootState>, payload: any) {
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
  clearListItemTimeout (actionContext: ActionContext<Function, RootState>, listItem: ListItemModel) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.LIST_ITEM_TIMEOUT_CLEARED, listItem)
      resolve('')
    })
  },
  setCurrentNote (actionContext: ActionContext<Function, RootState>, currentNote: NoteModel) {
    return new Promise(function (resolve) {
      actionContext.commit(mutationTypes.CURRENT_NOTE_SET, currentNote)
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
