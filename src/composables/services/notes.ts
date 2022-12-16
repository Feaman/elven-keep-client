import { computed, ref, Ref } from 'vue'
import { TListItemModel, type TVariant } from '~/composables/models/list-item'
import noteModel, { TNote, TNoteModel } from '~/composables/models/note'
import StatusesService from '~/composables/services/statuses'
import ApiService from '~/services/api/api'

const currentNote: Ref<TNoteModel | null> = ref(null)
const notes: Ref<TNoteModel[]> = ref([])
export const searchQuery = ref('')

function generateNotes(notesData: TNote[]) {
  notesData.forEach((noteData: TNote) => {
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

function findListItemVariants(listItem: TListItemModel) {
  const variants: TVariant[] = []
  const query = listItem.text.toLocaleLowerCase()

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
      const duplicates = variants.filter((_element) => (
        variant.listItemId !== _element.listItemId
        && _element.text.toLowerCase() === variant.text.toLowerCase()
        && _element.noteId === listItem.noteId
      ))
      variant.duplicatesQuantity = duplicates.length
      resultVariants.push(variant)
    }
  })

  // Highlight
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

  return resultVariants.slice(0, 10)
}

function setOrder(note: TNoteModel, order: number[]) {
  ApiService.setOrder(note, order)
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
  await ApiService.removeNote(note)
}

export default {
  currentNote,
  notes,
  filtered,
  searchQuery,
  generateMaxOrder,
  generateNotes,
  findNoteListItemVariants,
  clear,
  setOrder,
  findListItemVariants,
  removeNote,
}
