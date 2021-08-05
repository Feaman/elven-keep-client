import { RootState } from '~/store'
import NoteModel, { INote } from '~/models/note'
import ListItemModel, { IListItem } from '~/models/list-item'
import TypeModel from '~/models/type'
import StatusModel from '~/models/status'
import UserModel from '~/models/user'

export default {
  setNotes (state: RootState, notes: Array<NoteModel>) {
    state.notes = notes
  },
  setSSESalt (state: RootState, SSESalt: string) {
    state.SSESalt = SSESalt
  },
  setTypes (state: RootState, types: TypeModel[]) {
    state.types = types
  },
  setUser (state: RootState, user: UserModel) {
    state.user = user
  },
  setStatuses (state: RootState, statuses: StatusModel[]) {
    state.statuses = statuses
  },
  setMainListScrollTop (state: RootState, scrollTop: number) {
    state.mainListScrollTop = scrollTop
  },
  updateNoteListSortedBy (_state: RootState, note: NoteModel) {
    note.list.sort((previousItem, nextItem) => (previousItem.updated || 0) < (nextItem.updated || 0) ? -1 : 1)
  },
  addNoteCoAuthor (_state: RootState, payload: any) {
    payload.note.coAuthors.push(payload.noteCoAuthor)
  },
  removeNoteCoAuthor (_state: RootState, payload: any) {
    payload.note.coAuthors = payload.note.coAuthors.filter((coAuthor: UserModel) => coAuthor.id !== payload.coAuthor.id)
  },
  setIsNoteSaving (state: RootState, isNoteSaving: boolean) {
    state.isNoteSaving = isNoteSaving
  },
  setIsInitInfoLoading (state: RootState, isInitInfoLoading: boolean) {
    state.isInitInfoLoading = isInitInfoLoading
  },
  addNote (state: RootState, note: NoteModel) {
    state.notes.unshift(note)
  },
  updateNote (_state: RootState, { note, data }: { note: NoteModel, data: INote }) {
    Object.assign(note, data)
  },
  removeNote (state: RootState, note: NoteModel) {
    state.notes = state.notes.filter((_note: NoteModel) => _note.id !== note.id)
  },
  clearNoteTimeout (_state: RootState, note: NoteModel) {
    note.saveTimeout && clearTimeout(note.saveTimeout)
  },
  addListItem (_state: RootState, listItem: ListItemModel) {
    listItem.note?.list.push(listItem)
  },
  updateListItem (_state: RootState, { listItem, data }: { listItem: ListItemModel, data: IListItem }) {
    Object.assign(listItem, data)
  },
  removeListItem (_state: RootState, listItem: ListItemModel) {
    if (listItem.note?.list) {
      listItem.note.list = listItem?.note?.list.filter(_listItem => _listItem.id !== listItem.id)
    }
  },
  setSearchQuery (state: RootState, searchQuery: string) {
    state.searchQuery = searchQuery
  },
}
