import { Ref, computed, nextTick, ref } from 'vue'
import { TListItemModel, type TListItem, type TVariant } from '~/composables/models/list-item'
import noteModel, { TNote, TNoteModel } from '~/composables/models/note'
import ListItemsService from '~/composables/services/list-items'
import StatusesService from '~/composables/services/statuses'
import TypesService from '~/composables/services/types'
import ApiService from '~/services/api/api'
import { TYPE_TEXT } from '../models/type'

const currentNote: Ref<TNoteModel | null> = ref(null)
const notes: Ref<TNoteModel[]> = ref([])
const removingNotes = ref<TNoteModel[]>([])
export const searchQuery = ref('')

function generateNotes(notesData: TNote[]) {
  notes.value = []
  notesData.forEach((noteData: TNote) => {
    const note = noteModel(noteData)
    notes.value.push(note as unknown as TNoteModel)
  })
}

function setNotesOrder(order: number[]) {
  ApiService.setNotesOrder(order)
}

const filtered = computed({
  get() {
    const resultNotes = notes.value.filter((note) => note.statusId === StatusesService.active.value.id)

    resultNotes.sort((previousItem, nextItem) => ((previousItem.order || previousItem.id || 0) < (nextItem.order || nextItem.id || 0) ? -1 : 1))

    if (!searchQuery.value) {
      return resultNotes
    }

    return resultNotes.filter((note: TNoteModel) => {
      const regExp = new RegExp(searchQuery.value.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
      let foundInLisListItems = false
      note.list.forEach((listItem) => {
        if (regExp.test(listItem.text || '')) {
          foundInLisListItems = true
        }
      })
      return regExp.test(note.title || '') || regExp.test(note.text || '') || foundInLisListItems
    })
  },
  set(newList) {
    newList.forEach((note, index) => {
      note.order = index + 1
    })
    setNotesOrder(newList.map((note) => Number(note.id)))
  },
})

function findNoteListItemVariants(note: TNoteModel, variants: TVariant[], listItem: TListItemModel, query: string) {
  note.list
    .filter((_listItem) => _listItem !== listItem && _listItem.statusId !== StatusesService.inactive.value.id)
    .forEach((_listItem) => {
      if (
        _listItem.text.toLowerCase().includes(query)
        && !variants.find((variant) => variant.listItemId === _listItem.id)
      ) {
        const isExists = listItem.noteId === note.id && !_listItem.completed
        const text = _listItem.text.trim()
        variants.push({
          noteId: Number(_listItem.noteId),
          listItemId: Number(_listItem.id),
          text,
          highlightedText: text,
          isExists,
          focused: false,
        })
      }
    })
}

function findListItemVariants(listItem: TListItemModel) {
  const variants: TVariant[] = []
  const query = listItem.text.toLocaleLowerCase()

  if (query.length > 1) {
    notes.value.forEach((note) => {
      if (note.isList) {
        findNoteListItemVariants(note, variants, listItem, query)
      }
    })
  }

  // Sort
  variants.sort((previousItem, nextItem) => {
    if (previousItem.text === nextItem.text) {
      return 0
    }
    return previousItem.text > nextItem.text ? -1 : 1
  })

  // Duplicates
  const currentNoteVariants = variants.filter((variant) => variant.noteId === listItem.noteId)
  currentNoteVariants.forEach((variant) => {
    const duplicates = currentNoteVariants.filter((_element) => (
      variant.listItemId !== _element.listItemId
      && _element.text.toLowerCase() === variant.text.toLowerCase()
    ))
    variant.duplicatesQuantity = duplicates.length
  })

  // Unique
  let resultVariants: TVariant[] = []
  const resultVariantsObject: { [key: string]: TVariant } = {}
  variants
    .reduce((accumulator: TVariant[], item: TVariant) => {
      if (item.noteId === listItem.noteId) {
        return [...accumulator, item]
      }
      return [item, ...accumulator]
    }, [])
    .forEach((variant) => {
      resultVariantsObject[variant.text.toLowerCase()] = variant
    })
  resultVariants = Object.values(resultVariantsObject)

  // Highlight
  const regexp = new RegExp(query.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
  resultVariants.forEach((variant) => {
    variant.highlightedText = variant.text.replace(regexp, (text: string) => `<span class="text-green">${text}</span>`)
  })

  if (
    resultVariants.length === 1
    && resultVariants[0].text === listItem.text
    && resultVariants[0].noteId !== listItem.noteId
  ) {
    return []
  }

  return resultVariants.slice(0, 15)
}

function setListItemsOrder(note: TNoteModel, order: number[]) {
  ApiService.setListItemsOrder(note, order)
}

function generateMaxOrder() {
  let order = 0
  if (notes.value.length) {
    const numbers = notes.value.map((note) => note.order)
    order = Math.max(...numbers)
  }

  return order + 1
}

async function removeNote(note: TNoteModel) {
  note.statusId = StatusesService.inactive.value.id
  removingNotes.value.push(note as unknown as TNoteModel)
  await ApiService.removeNote(note)
}

async function updateNote(note: TNoteModel, noteData: TNote) {
  noteData.isCompletedListExpanded = !!noteData.isCompletedListExpanded
  note.isRawUpdate = true
  if (noteData.typeId === TypesService.findByName(TYPE_TEXT).id) {
    Object.assign(note, noteData)
  } else {
    note.title = noteData.title || ''
    let listData: TListItem[] = []
    if (noteData.list) {
      listData = noteData.list
      delete noteData.list
    }
    Object.assign(note, noteData)

    // Handle list update
    listData.forEach(async (listItemData) => {
      listItemData.checked = !!listItemData.checked
      listItemData.completed = !!listItemData.completed
      const existedListItem = note?.list.find((listItem) => listItem.id === listItemData.id)
      if (existedListItem) {
        Object.assign(existedListItem, listItemData)
        existedListItem.handleDataTransformation()
      } else if (note) {
        ListItemsService.addListItem(note, listItemData)
      }
    })

    // Handle deleted list items
    const listItemsToDelete: number[] = []
    note.list.forEach((listItem) => {
      const existedListItem = listData.find((listItemData) => listItem.id === listItemData.id)
      if (!existedListItem && listItem.id) {
        listItemsToDelete.push(listItem.id)
      }
    })
    note.list = note.list.filter((listItem) => listItem.id && !listItemsToDelete.includes(listItem.id))
  }
  note.handleDataTransformation(noteData.user, noteData.coAuthors)
  await nextTick()
  note.isRawUpdate = false
}

function find(noteId: number) {
  const note = notes.value.find((note) => note.id === noteId)
  if (!note) {
    throw new Error(`Note width id "${noteId}" not found`)
  }
  return note
}

export default {
  currentNote,
  notes,
  filtered,
  searchQuery,
  removingNotes,
  find,
  updateNote,
  generateMaxOrder,
  generateNotes,
  findNoteListItemVariants,
  setOrder: setListItemsOrder,
  findListItemVariants,
  removeNote,
}
