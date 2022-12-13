import { computed, ref, Ref } from 'vue'
import coAuthorModel, { TCoAuthorModel } from '~/composables/models/co-author'
import { TListItemModel, type TVariant } from '~/composables/models/list-item'
import noteModel, { INote, TNoteModel } from '~/composables/models/note'
import StatusesService from '~/composables/services/statuses'
import BaseService from '~/services/base'

const notes: Ref<TNoteModel[]> = ref([])
const { api } = BaseService
export const searchQuery = ref('')

function generateNotes(notesData: INote[]) {
  notesData.forEach((noteData: INote) => {
    const note = noteModel(noteData)
    notes.value.push(note as unknown as TNoteModel)
  })
}

const filtered = computed(() => {
  const resultNotes = notes.value.filter((note) => note.statusId === StatusesService.active.value.id)

  resultNotes.sort((previousItem, nextItem) => ((previousItem.id || 0) < (nextItem.id || 0) ? 1 : -1))

  if (!searchQuery.value) {
    return resultNotes
  }

  return resultNotes.filter((note: TNoteModel) => {
    const regExp = new RegExp(searchQuery.value, 'i')
    let foundInLisListItems = false
    note.list.forEach((listItem) => {
      if (regExp.test(listItem.text || '')) {
        foundInLisListItems = true
      }
    })
    return regExp.test(note.title || '') || regExp.test(note.text || '') || foundInLisListItems
  })
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

function findListItemVariants(listItem: TListItemModel, query: string) {
  const variants: TVariant[] = []
  query = query.toLocaleLowerCase()

  if (query.length > 1) {
    notes.value.forEach((note) => {
      if (note.isList()) {
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

  // Duplicates and unique
  const resultVariants: TVariant[] = []
  const regexp = new RegExp(query, 'i')
  variants.forEach((variant) => {
    if (!resultVariants.find((item) => item.text.toLowerCase() === variant.text.toLowerCase())) {
      const duplicates = variants.filter((_element) => variant.listItemId !== _element.listItemId
        && _element.text.toLowerCase() === variant.text.toLowerCase())
      variant.duplicatesQuantity = duplicates.length
      resultVariants.push(variant)
    }
  })

  // Highlight
  variants.forEach((variant) => {
    variant.highlightedText = variant.text.replace(regexp, (text: string) => `<span class="green--text">${text}</span>`)
  })

  return resultVariants
}

function addNoteCoAuthor(note: TNoteModel, coAuthor: TCoAuthorModel) {
  note.addCoAuthor(coAuthor)
}

async function addCoAuthor(note: TNoteModel, email: string) {
  const noteCoAuthorData = await api.addNoteCoAuthor(note, email)
  addNoteCoAuthor(note, coAuthorModel(noteCoAuthorData) as unknown as TCoAuthorModel)
}

function setOrder(note: TNoteModel, order: number[]) {
  api.setOrder(note, order)
}

function clear() {
  notes.value.forEach((note: TNoteModel) => {
    note.list.forEach((listItem) => {
      if (listItem.statusId === StatusesService.inactive.value.id) {
        // listItem.removeFromState()
      }
    })
    if (note.statusId === StatusesService.inactive.value.id) {
      // note.removeFromState()
    }
  })
}

function find(noteId: number) {
  const note = notes.value.find((note) => note.id === noteId)
  if (!note) {
    throw new Error(`Note with id "${noteId}" not found`)
  }

  return note
}

function generateMaxOrder(listItemId: number, list: TListItemModel[]) {
  let order = 0
  if (list.length) {
    const numbers = list
      .filter((_listItem) => _listItem.id !== listItemId)
      .map((listItem) => listItem.order)
    order = Math.max(...numbers)
  }

  return order + 1
}

async function removeNote(note: TNoteModel, addRemovingNote = true) {
  note.hide(addRemovingNote)
  // await BaseService.api.removeNote(note)
}

export default {
  notes,
  filtered,
  searchQuery,
  generateMaxOrder,
  find,
  generateNotes,
  findNoteListItemVariants,
  clear,
  setOrder,
  addCoAuthor,
  findListItemVariants,
  removeNote,
}
