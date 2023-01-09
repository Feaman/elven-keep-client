import { computed, Ref, ref, UnwrapRef, watch } from 'vue'
import coAuthorModel, { ICoAuthor, TCoAuthorModel } from '~/composables/models/co-author'
import listItemModel, { TListItem, TListItemModel, type TVariant } from '~/composables/models/list-item'
import { TStatusModel } from '~/composables/models/status'
import { TYPE_LIST, type TTypeModel } from '~/composables/models/type'
import userModel, { IUser, TUserModel } from '~/composables/models/user'
import ListItemsService from '~/composables/services/list-items'
import NotesService from '~/composables/services/notes'
import StatusesService from '~/composables/services/statuses'
import TypesService from '~/composables/services/types'
import ApiService from '~/services/api/api'
import BaseService from '~/services/base'
import { useGlobalStore } from '~/stores/global'

export interface TNote {
  id?: number
  title?: string | ''
  text?: string | ''
  type?: TTypeModel
  typeId?: number
  statusId?: number
  status?: TStatusModel
  userId?: number
  user?: IUser
  order?: number
  isCompletedListExpanded?: boolean
  list?: TListItem[]
  coAuthors?: ICoAuthor[]
  created?: string
  updated?: string
}

export default function noteModel(noteData: TNote) {
  const id = ref(noteData.id)
  const isSaving = ref(false)
  const title = ref(noteData.title || '')
  const userId = ref(noteData.userId)
  const order = ref(noteData.order)
  const text = ref(noteData.text || '')
  const typeId = ref(noteData.typeId || TypesService.list.value.id)
  const type = ref<TTypeModel | null>(null)
  const created = ref(noteData.created ? new Date(noteData.created) : null)
  const updated = ref(noteData.updated ? new Date(noteData.updated) : null)
  const statusId = ref(noteData.statusId || StatusesService.active.value.id)
  const status = computed(() => StatusesService.findById(statusId.value))
  const list: Ref<TListItemModel[]> = ref([])
  const coAuthors = ref<TCoAuthorModel[]>([])
  const user = ref<TUserModel | null>(null)
  const isCompletedListExpanded = ref(!!noteData.isCompletedListExpanded)
  const isCreating = ref(false)
  const isUpdateNeeded = ref(false)
  const unSavedListItems = ref<TListItemModel[]>([])
  const isList = computed(() => type.value?.name === TYPE_LIST)
  // let logId = 0

  const globalStore = useGlobalStore()

  function handleList(listData: TListItem[] = []) {
    listData.forEach((listItemData) => list.value.push(listItemModel(listItemData) as unknown as TListItemModel))
  }

  function handleUser(userData: IUser | undefined) {
    if (userData) {
      user.value = userModel(userData) as unknown as TUserModel
    }
  }

  function handleCoAuthors(coAuthorsData: ICoAuthor[] = []) {
    coAuthorsData.forEach((coAuthorData) => coAuthors.value.push(coAuthorModel(coAuthorData) as unknown as TCoAuthorModel))
  }

  function handleType() {
    const foundType = TypesService.types.value.find((_type) => _type.id === typeId.value)
    if (!foundType) {
      throw new Error(`Type '${typeId.value}' not found`)
    } else {
      type.value = foundType
    }
  }

  // async function createListItem(listItem: TListItemModel, logIid: number) {
  async function createListItem(listItem: TListItemModel) {
    listItem.noteId = id.value
    const data = await ApiService.addListItem(listItem)
    listItem.id = data.id
    listItem.created = new Date(data.created || '')
    listItem.updated = new Date(data.updated || '')
    listItem.isCreating = false
    if (listItem.isUpdateNeeded) {
      // console.log(`${logIid}: final update list item`)
      const data = await ApiService.updateListItem(listItem)
      listItem.updated = new Date(data.updated || '')
      listItem.isUpdateNeeded = false
    }
  }

  // async function save(logIid: number) {
  async function save() {
    try {
      isSaving.value = true
      if (id.value) {
        await ApiService.updateNote(id.value, title.value, text.value, typeId.value, isCompletedListExpanded.value)
      } else if (isCreating.value) {
        isUpdateNeeded.value = true
      } else {
        isCreating.value = true
        const noteData = await ApiService.addNote(list.value, title.value, text.value, typeId.value, isCompletedListExpanded.value)
        id.value = noteData.id
        userId.value = noteData.user?.id
        window.history.replaceState({}, '', `/note/${noteData.id}`)
        isCreating.value = false
        if (isUpdateNeeded.value && id.value) {
          await ApiService.updateNote(id.value, title.value, text.value, typeId.value, isCompletedListExpanded.value)
          isUpdateNeeded.value = false
        }
        // unSavedListItems.value.forEach((listItem) => createListItem(listItem, logIid))
        unSavedListItems.value.forEach((listItem) => createListItem(listItem))
      }
      isSaving.value = false
    } catch (error) {
      BaseService.showError(error as Error)
    }
  }

  function addListItem(listItem: TListItemModel) {
    const order = list.value.length ? Math.max(...list.value.map((listItem) => listItem.order)) + 1 : 1
    listItem.noteId = id.value
    listItem.order = order
    list.value.push(listItem as unknown as TListItemModel)
  }

  async function saveListItem(listItem: TListItemModel) {
    try {
      if (!list.value.includes(listItem)) {
        throw new Error(`List item with id "${listItem.id}" doesn't exists in note's with id "${id.value}" list`)
      }
      isSaving.value = true
      // logId += 1
      // const logIid = logId
      if (listItem.id) {
        // console.log(`${logIid}: update list item`)
        const data = await ApiService.updateListItem(listItem)
        listItem.updated = new Date(data.updated || '')
      } else if (listItem.isCreating) {
        // console.log(`${logIid}: need update`)
        listItem.isUpdateNeeded = true
      } else {
        listItem.isCreating = true
        if (!id.value) {
          if (!isCreating.value) {
            // console.log(`${logIid}: create note`)
            // save(logIid)
            save()
          }
          // console.log(`${logIid}: schedule list item`)
          unSavedListItems.value.push(listItem)
        } else {
          // console.log(`${logIid}: create list item`)
          // await createListItem(listItem, logId)
          await createListItem(listItem)
        }
      }
      isSaving.value = false
    } catch (error) {
      BaseService.showError(error as Error)
    }
  }

  async function restore() {
    let result
    try {
      if (id.value) {
        statusId.value = StatusesService.active.value.id
        result = await ApiService.restoreNote(id.value)
      }
      result = Promise.resolve()
    } catch (error) {
      BaseService.showError(error as Error)
    }

    return result
  }

  const isMyNote = computed(() => globalStore.user?.id === userId.value)

  const isFocused = computed(() => !!list.value.find((listItem) => listItem.focused))

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

  const completedListItems = computed(() => filterAndSort(true)) as Ref<TListItemModel[]>

  const checkedListItems = computed(
    () => list.value.filter((listItem) => listItem.checked
      && !listItem.completed
      && listItem.statusId === StatusesService.active.value.id),
  ) as Ref<TListItemModel[]>

  const mainListItems = computed(() => filterAndSort()) as Ref<TListItemModel[]>

  function addCoAuthor(coAuthor: TCoAuthorModel) {
    coAuthors.value.push(coAuthor)
  }

  async function createCoAuthor(email: string) {
    const noteCoAuthorData = await ApiService.addNoteCoAuthor(Number(id.value), email)
    addCoAuthor(coAuthorModel(noteCoAuthorData) as unknown as TCoAuthorModel)
  }

  async function removeCoAuthor(coAuthor: TCoAuthorModel) {
    try {
      if (userId.value !== globalStore.user?.id) {
        NotesService.notes.value = NotesService.notes.value.filter((note) => note.id !== id.value)
        BaseService.router.push('/')
      } else {
        coAuthors.value = coAuthors.value.filter((_coAuthor) => _coAuthor.id !== coAuthor.id)
      }
      await ApiService.removeNoteCoAuthor(coAuthor)
    } catch (error) {
      BaseService.showError(error as Error)
    }
  }

  function removeListItemSoft(item: TListItemModel) {
    list.value = list.value.filter((_item) => _item.id !== item.id)
  }

  async function removeListItem(listItem: TListItemModel, addToRestore = true) {
    if (listItem.id) {
      listItem.statusId = StatusesService.inactive.value.id
      if (addToRestore) {
        ListItemsService.removingListItems.value.push(listItem as unknown as TListItemModel)
      }
      await ApiService.removeListItem(listItem)
    }
  }

  function completeListItem(listItem: TListItemModel, isCompleted: boolean) {
    listItem.completed = isCompleted
    listItem.order = NotesService.generateMaxOrder(Number(id.value), list.value)
    saveListItem(listItem)
  }

  async function completeAllChecked() {
    checkedListItems.value.forEach((listItem) => {
      completeListItem(listItem, true)
    })
  }

  function blurListItem(listItem: TListItemModel) {
    listItem.focused = false
    if (!listItem.text.trim()) {
      if (listItem.id) {
        removeListItem(listItem, false)
      } else {
        setTimeout(() => removeListItemSoft(listItem), 200)
      }
    } else if (listItem.text !== listItem.text.trim()) {
      listItem.text = listItem.text.trim()
      saveListItem(listItem)
    }
    const $textArea = listItem.getTextarea()
    ListItemsService.handleListItemTextAreaHeight($textArea)
    if ($textArea && $textArea.parentElement) {
      $textArea.parentElement.scrollTop = 0
    }
  }

  function selectVariant(listItem: TListItemModel, variant: TVariant) {
    if (variant.noteId === listItem.noteId && variant.listItemId !== listItem.id) {
      const existentListItem = list.value.find((listItem: TListItemModel) => listItem.id === variant.listItemId)
      if (!existentListItem) {
        throw new Error('List item not found')
      }
      existentListItem.completed = false
      existentListItem.checked = false
      existentListItem.order = listItem.order
      saveListItem(existentListItem)
      removeListItem(listItem, false)
      return existentListItem
    }

    listItem.text = variant.text
    saveListItem(listItem)
    return listItem
  }

  function checkOrUncheckListItem(listItem: TListItemModel, isChecked: boolean) {
    listItem.checked = isChecked
    saveListItem(listItem)
  }

  handleList(noteData.list)
  handleCoAuthors(noteData.coAuthors)
  handleType()
  handleUser(noteData.user)

  // watch(title, () => save(10000))
  // watch(text, () => save(10000))
  // watch(isCompletedListExpanded, () => save(10000))
  watch(title, () => save())
  watch(text, () => save())
  watch(isCompletedListExpanded, () => save())

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
    isSaving,
    checkedListItems,
    isFocused,
    isCreating,
    isUpdateNeeded,
    user,
    isList,
    order,
    checkOrUncheckListItem,
    addCoAuthor,
    createCoAuthor,
    removeCoAuthor,
    save,
    completeListItem,
    removeListItemSoft,
    handleList,
    handleCoAuthors,
    completeAllChecked,
    saveListItem,
    removeListItem,
    addListItem,
    selectVariant,
    blurListItem,
    restore,
  }
}

export type TNoteModel = UnwrapRef<ReturnType<typeof noteModel>>
