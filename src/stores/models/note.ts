import { defineStore } from 'pinia'
import { Ref, ref } from 'vue'
import { CoAuthorModel, ICoAuthor, useCoAuthorStore } from '~/stores/models/co-author'
import useListItemStore, { ListItemModel, IListItem } from '~/stores/models/list-item'
import { useStatusesStore } from '~/stores/statuses'
import { TypeModel, TYPE_LIST } from '~/stores/models/type'
import { useTypesStore } from '~/stores/types'
import useUserStore, { IUser } from './user'
import { StatusModel } from './status'

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

export default function useNoteStore(noteData: INote) {
  return defineStore(`note-${noteData.id}`, () => {
    const statusesStore = useStatusesStore()
    const typesStore = useTypesStore()

    const id = ref(noteData.id)
    const title = ref(noteData.title || '')
    const userId = ref(noteData.userId)
    const text = ref(noteData.text || '')
    const typeId = ref(noteData.typeId || typesStore.getDefault().id)
    const type = ref<TypeModel | null>(null)
    const created = ref(noteData.created ? new Date(noteData.created) : null)
    const updated = ref(noteData.updated ? new Date(noteData.updated) : null)
    const statusId = ref(noteData.statusId || statusesStore.getActive().id)
    const status = ref(statusesStore.findById(statusId.value))
    const list: Ref<ListItemModel[]> = ref([])
    const coAuthors: Ref<CoAuthorModel[]> = ref([])
    const isCompletedListExpanded = ref(!!noteData.isCompletedListExpanded)

    // if (noteData.user) {
    // user.value = useUserStore(noteData.user)
    // }

    function handleList(listData: IListItem[] = []) {
      listData.forEach((listItemData) => list.value.push(useListItemStore(listItemData)))
    }

    function handleCoAuthors(coAuthorsData: ICoAuthor[] = []) {
      coAuthorsData.forEach((coAuthorData) => coAuthors.value.push(useCoAuthorStore(coAuthorData)))
    }

    function handleType() {
      const foundType = typesStore.types.find((_type) => _type.id === typeId.value)
      if (!foundType) {
        throw new Error(`Type '${typeId.value}' not found`)
      } else {
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

    // async remove(addRemovingNote = true) {
    //   this.hide(addRemovingNote)
    //   try {
    //     await ApiService.removeNote(this)
    //   } catch (error) {
    //     NotesService.error(error)
    //   }
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

    // hide(addRemovingNote = true) {
    //   this.setStatus(StatusesService.getInActive())
    //   if (addRemovingNote) {
    //     BaseService.vuex.commit('addRemovingNote', this)
    //   }
    // }

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

    function addCoAuthor(coAuthor: CoAuthorModel) {
      coAuthors.value.push(coAuthor)
    }

    handleList(noteData.list)
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
      addCoAuthor,
      isList,
      handleList,
      handleCoAuthors,
      // isText,
      // addListItem,
      // handleType,
      // save,
    }
  })()
}

export type NoteModel = ReturnType<typeof useNoteStore>
