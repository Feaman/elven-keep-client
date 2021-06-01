import * as types from './mutations-types'
import { RootState } from '~/store'
import NoteModel, { NoteDataObject } from '~/models/note'
import ListItemModel, { ListItemDataObject } from '~/models/list-item'
import TypeModel from '~/models/type'
import StatusModel from '~/models/status'
import UserModel from '~/models/user'

export default {
  [types.NOTES_SET] (state: RootState, notes: Array<NoteModel>) {
    state.notes = notes
  },
  [types.TYPES_SET] (state: RootState, types: TypeModel[]) {
    state.types = types
  },
  [types.USER_SET] (state: RootState, user: UserModel) {
    state.user = user
  },
  [types.STATUSES_SET] (state: RootState, statuses: StatusModel[]) {
    state.statuses = statuses
  },
  [types.MAIN_LIST_SCROLL_TOP_SET] (state: RootState, scrollTop: number) {
    state.mainListScrollTop = scrollTop
  },
  [types.NOTE_CO_AUTHOR_ADDED] (_state: RootState, payload: any) {
    payload.note.coAuthors.push(payload.noteCoAuthor)
  },
  [types.NOTE_CO_AUTHOR_REMOVED] (_state: RootState, payload: any) {
    payload.note.coAuthors = payload.note.coAuthors.filter((coAuthor: UserModel) => coAuthor.id !== payload.coAuthor.id)
  },
  [types.NOTE_SAVING_SET] (state: RootState, isNoteSaving: boolean) {
    state.isNoteSaving = isNoteSaving
  },
  [types.INIT_INFO_LOADING_SET] (state: RootState, isInitInfoLoading: boolean) {
    state.isInitInfoLoading = isInitInfoLoading
  },
  [types.NOTE_SET] (state: RootState, note: NoteModel) {
    state.notes.unshift(note)
  },
  [types.NOTE_UNSET] (state: RootState, note: NoteModel) {
    state.notes = state.notes.filter((_note: NoteModel) => _note.id !== note.id)
  },
  [types.NOTE_TIMEOUT_CLEARED] (_state: RootState, note: NoteModel) {
    note.saveTimeout && clearTimeout(note.saveTimeout)
  },
  [types.LIST_ITEM_TIMEOUT_CLEARED] (_state: RootState, listItem: ListItemModel) {
    listItem.saveTimeout && clearTimeout(listItem.saveTimeout)
  },
  [types.LIST_ITEM_ADDED] (_state: RootState, listItem: ListItemModel) {
    listItem.note?.list.push(listItem)
  },
  [types.LIST_ITEM_REMOVED] (_state: RootState, listItem: ListItemModel) {
    if (listItem.note?.list) {
      listItem.note.list = listItem?.note?.list.filter(_listItem => _listItem.id !== listItem.id)
    }
  },
  [types.LIST_ITEM_UPDATED] (_state: RootState, { listItem, data }: { listItem: ListItemModel, data: ListItemDataObject }) {
    Object.assign(listItem, data)
  },
  [types.NOTE_UPDATED] (_state: RootState, { note, data }: { note: NoteModel, data: NoteDataObject }) {
    Object.assign(note, data)
  },
  [types.SEARCH_QUERY_SET] (state: RootState, searchQuery: string) {
    state.searchQuery = searchQuery
  },
}
