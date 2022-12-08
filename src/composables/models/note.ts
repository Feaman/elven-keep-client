import { computed, ref, UnwrapRef } from 'vue'
import coAuthorModel, { CoAuthorModel, ICoAuthor } from '~/composables/models/co-author'
import listItemModel, { IListItem, ListItemModel } from '~/composables/models/list-item'
import { StatusModel } from '~/composables/models/status'
import { TypeModel, TYPE_LIST } from '~/composables/models/type'
import StatusesService from '~/composables/services/statuses'
import typesService from '~/composables/services/types'
import { useGlobalStore } from '~/stores/global'
import { IUser } from './user'

export interface INote {
  id: number
  title: string | ''
  text: string | ''
  type: TypeModel
  typeId: number
  statusId: number
  status: StatusModel
  userId: number
  user: IUser
  isCompletedListExpanded: boolean
  saveTimeout: ReturnType<typeof setTimeout> | null
  list: IListItem[]
  coAuthors: ICoAuthor[]
  created: string
  updated: string
}

export default function noteModel(noteData: INote) {
  const id = ref(noteData.id)
  const title = ref(noteData.title || '')
  const userId = ref(noteData.userId)
  const text = ref(noteData.text || '')
  const typeId = ref(noteData.typeId || typesService.list.value.id)
  const type = ref<TypeModel | null>(null)
  const created = ref(noteData.created ? new Date(noteData.created) : null)
  const updated = ref(noteData.updated ? new Date(noteData.updated) : null)
  const statusId = ref(noteData.statusId || StatusesService.active.value.id)
  const status = computed(() => StatusesService.findById(statusId.value))
  const list = ref<ListItemModel[]>([])
  const coAuthors = ref<CoAuthorModel[]>([])
  const isCompletedListExpanded = ref(!!noteData.isCompletedListExpanded)

  // if (noteData.user) {
  // user.value = useUserStore(noteData.user)
  // }

  function handleList(listData: IListItem[] = []) {
    listData.forEach((listItemData) => list.value.push(listItemModel(listItemData) as unknown as ListItemModel))
  }

  function handleCoAuthors(coAuthorsData: ICoAuthor[] = []) {
    coAuthorsData.forEach((coAuthorData) => coAuthors.value.push(coAuthorModel(coAuthorData) as unknown as CoAuthorModel))
  }

  function handleType() {
    // @ts-ignore
    const foundType = typesService.types.value.find((_type) => _type.id === typeId.value)
    if (!foundType) {
      throw new Error(`Type '${typeId.value}' not found`)
    } else {
      // @ts-ignore
      type.value = foundType
    }
  }

  function isList() {
    return type.value?.name === TYPE_LIST
  }

  // function isText() {
  //   return this.type?.name === TypeModel.TYPE_TEXT
  // }

  // function addListItem(listItemData: IListItem | null = null) {
  //   console.log(listItemData, this)
  //   // const order = this.list.length ? Math.max.apply(Math, this.list.map((listItem) => listItem.order)) + 1 : 1
  //   // const listItem = new ListItemModel(
  //   // {
  //   // noteId: this.id,
  //   // updated: new Date(),
  //   // order,
  //   // ...listItemData || { text: '' },
  //   // note: this,
  //   // },
  //   // )
  //   // NotesService.vuex.commit('addListItem', listItem)
  //   //
  //   // return listItem
  // }

  // function save(savingText = false): Promise<INote> {
  //   console.log(savingText, this)
  //   // NotesService.vuex.commit('clearNoteTimeout', this)
  //   return new Promise((resolve) => {
  //     //   const saveTimeout = setTimeout(() => {
  //     //     if (this.id) {
  //     //       ApiService.updateNote(this)
  //     //         .then((data) => resolve(data))
  //     //         .catch((error) => NotesService.error(error))
  //     //     } else {
  //     //       NotesService.vuex.commit('addNote', this)
  //     //       return ApiService.addNote(this)
  //     //         .then((noteData) => {
  //     //           history.replaceState({}, '', `/note/${noteData.id}`)
  //     //           const newNoteData: INote = {
  //     //             id: noteData.id,
  //     //             userId: noteData.userId,
  //     //           }
  //     //           if (noteData.user) {
  //     //             newNoteData.user = new UserModel(noteData.user)
  //     //           }
  //     //           this.updateState(newNoteData)
  //     //           resolve(newNoteData)
  //     //         })
  //     //         .catch((error) => NotesService.error(error))
  //     //     }
  //     //   }, savingText ? 400 : 0)
  //     // this.updateState({ saveTimeout })
  //   })
  // }

  // update(data: INote) {
  //   NotesService.vuex.commit('updateNote', { note: this, data })
  //   return this.save(!!(data.text || data.title))
  // }

  // updateState(data: INote) {
  //   NotesService.vuex.commit('updateNote', { note: this, data })
  // }

  // removeFromState() {
  //   BaseService.vuex.commit('removeNote', this)
  // }

  // setNoteToListItems() {
  // this.list.forEach((listItem) => listItem.updateState({ note: this }))
  // }

  // removeCoAuthor(coAuthor: CoAuthorModel) {
  //   NotesService.vuex.commit('removeNoteCoAuthor', { note: this, coAuthor })
  //   return ApiService.removeNoteCoAuthor(coAuthor)
  // }

  // restore() {
  //   if (this.id) {
  //     this.setStatus(StatusesService.getActive())
  //     return ApiService.restoreNote(this)
  //       .catch((error) => BaseService.error(error))
  //   }
  //   return Promise.resolve()
  // }

  function hide(addRemovingNote = true) {
    statusId.value = StatusesService.inactive.value.id
    if (addRemovingNote) {
      // BaseService.vuex.commit('addRemovingNote', this)
    }
  }

  // setStatus(status: StatusModel) {
  //   this.updateState({ statusId: status.id, status })
  // }

  // checkIfClear() {
  //   const isList = this.type?.name === TypeModel.TYPE_LIST
  //   let listIsClear = true
  //   if (isList) {
  //     this.list.forEach((listItem) => {
  //       if (listItem.text) {
  //         listIsClear = false
  //       }
  //     })
  //   }

  //   return this.id && !(this.title || this.text || (isList && !listIsClear))
  // }

  const globalStore = useGlobalStore()
  const isMyNote = computed(() => globalStore.user?.id === userId.value)

  function filterAndSort(completed = false) {
    return list.value
      .filter((listItem) => (completed ? listItem.completed : !listItem.completed) && listItem.statusId === StatusesService.active.value.id)
      .sort((previousItem, nextItem) => ((previousItem.order || 0) < (nextItem.order || 0) ? -1 : 1))
      .sort((previousItem, nextItem) => {
        if (previousItem.checked === nextItem.checked) {
          return 0
        }
        return previousItem.checked ? 1 : -1
      })
  }

  const completedListItems = computed(
    () => list.value.filter((listItem) => listItem.completed && listItem.statusId === StatusesService.active.value.id),
  )

  const mainListItems = computed(
    () => filterAndSort(),
  )

  const isGradient = computed(() => type.value?.name === TYPE_LIST
    && mainListItems.value.length > 7 + (title.value ? 0 : 1) + (completedListItems.value.length ? -1 : 0))

  function addCoAuthor(coAuthor: CoAuthorModel) {
    coAuthors.value.push(coAuthor)
  }

  function removeItem(item: ListItemModel) {
    list.value = list.value.filter((_item) => _item.id !== item.id)
  }

  handleList(noteData.list)
  handleCoAuthors(noteData.coAuthors)
  handleType()

  return {
    id,
    title,
    userId,
    text,
    typeId,
    type,
    created,
    updated,
    statusId,
    list,
    status,
    isCompletedListExpanded,
    coAuthors,
    completedListItems,
    mainListItems,
    isMyNote,
    isGradient,
    hide,
    removeItem,
    addCoAuthor,
    isList,
    handleList,
    handleCoAuthors,
  }
}

export type NoteModel = UnwrapRef<ReturnType<typeof noteModel>>