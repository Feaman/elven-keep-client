import { defineStore } from 'pinia'
import { ref } from 'vue'
import { TGlobalError } from '~/services/base'
import useUserStore, { IUser, UserModel } from '../composables/models/user'

export const useGlobalStore = defineStore('global', () => {
  const initError = ref<TGlobalError | undefined>(undefined)
  const isLoading = ref(false)
  const user = ref<UserModel | null>(null)
  const mainListScrollTop = ref(0)
  const SSESalt = ''
  const isNoteSaving = false
  const isInitInfoLoading = true
  // const removingEntities = ref({
  //   notes: [] as NoteModel[],
  //   listItems: [] as ListItemModel[],
  // })

  // function updateNoteListSortedBy(_state: RootState, note: NoteModel) {
  // note.list.sort((previousItem, nextItem) => ((previousItem.updated || 0) < (nextItem.updated || 0) ? -1 : 1))
  // }
  // function removeNoteCoAuthor(_state: RootState, payload: any) {
  //   payload.note.coAuthors = payload.note.coAuthors.filter((coAuthor: UserModel) => coAuthor.id !== payload.coAuthor.id)
  // }
  // function setIsNoteSaving(state: RootState, isNoteSaving: boolean) {
  //   state.isNoteSaving = isNoteSaving
  // }
  // function setIsInitInfoLoading(state: RootState, isInitInfoLoading: boolean) {
  //   state.isInitInfoLoading = isInitInfoLoading
  // }
  // function addNote(state: RootState, note: NoteModel) {
  //   state.notes.unshift(note)
  // }
  // function updateNote(_state: RootState, { note, data }: { note: NoteModel, data: INote }) {
  //   Object.assign(note, data)
  // }
  // function removeNote(state: RootState, note: NoteModel) {
  //   state.notes = state.notes.filter((_note: NoteModel) => _note.id !== note.id)
  // }
  // function clearNoteTimeout(_state: RootState, note: NoteModel) {
  //   note.saveTimeout && clearTimeout(note.saveTimeout)
  // }
  // function addListItem(_state: RootState, listItem: ListItemModel) {
  //   listItem.note?.list.push(listItem)
  // }
  // function updateListItem(_state: RootState, { listItem, data }: { listItem: ListItemModel, data: IListItem }) {
  //   Object.assign(listItem, data)
  // }
  // function removeListItem(_state: RootState, listItem: ListItemModel) {
  //   if (listItem.note?.list) {
  //     listItem.note.list = listItem?.note?.list.filter((_listItem) => _listItem.id !== listItem.id)
  //   }
  // }
  // function addRemovingNote(state: RootState, note: NoteModel) {
  //   state.removingEntities.notes.push(note)
  // }
  // function addRemovingListItem(state: RootState, listItem: ListItemModel) {
  //   state.removingEntities.listItems.push(listItem)
  // }
  // function clearRemovingEntities() {
  //   removingEntities.value.notes = []
  //   removingEntities.value.listItems = []
  // }
  function setUser(userData: IUser) {
    user.value = useUserStore(userData) as unknown as UserModel
  }

  return {
    user,
    initError,
    isLoading,
    mainListScrollTop,
    SSESalt,
    isNoteSaving,
    isInitInfoLoading,
    // removingEntities,
    setUser,
  }
})
