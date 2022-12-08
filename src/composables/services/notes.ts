import { computed, ref, Ref } from 'vue'
import coAuthorModel, { CoAuthorModel } from '~/composables/models/co-author'
import { ListItemModel, Variant } from '~/composables/models/list-item'
import noteModel, { INote, NoteModel } from '~/composables/models/note'
import StatusesService from '~/composables/services/statuses'
import BaseService from '~/services/base'

const notes: Ref<NoteModel[]> = ref([])
const searchQuery = ref('')
const { api } = BaseService

function generateNotes(notesData: INote[]) {
  notesData.forEach((noteData: INote) => {
    const note = noteModel(noteData)
    // note.setNoteToListItems()
    notes.value.push(note as unknown as NoteModel)
  })
}

const filtered = computed(() => {
  const resultNotes = notes.value.filter((note) => note.statusId === StatusesService.active.value.id)

  resultNotes.sort((previousItem, nextItem) => ((previousItem.id || 0) < (nextItem.id || 0) ? 1 : -1))

  if (!searchQuery.value) {
    return resultNotes
  }

  return resultNotes.filter((note: NoteModel) => {
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

function findNoteListItemVariants(note: NoteModel, variants: Variant[], listItem: ListItemModel, query: string) {
  note.list
    .filter((_listItem) => _listItem !== listItem && _listItem.statusId !== StatusesService.active.value.id)
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

function findListItemVariants(listItem: ListItemModel, query: string) {
  const variants: Variant[] = []
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
  const resultVariants: Variant[] = []
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

function addNoteCoAuthor(note: NoteModel, coAuthor: CoAuthorModel) {
  note.addCoAuthor(coAuthor)
}

async function addCoAuthor(note: NoteModel, email: string) {
  const noteCoAuthorData = await api.addNoteCoAuthor(note, email)
  addNoteCoAuthor(note, coAuthorModel(noteCoAuthorData))
}

function setOrder(note: NoteModel, order: number[]) {
  api.setOrder(note, order)
}

function clear() {
  notes.value.forEach((note: NoteModel) => {
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

async function removeNote(note: NoteModel, addRemovingNote = true) {
  note.hide(addRemovingNote)
  // await BaseService.api.removeNote(note)
}

export default {
  notes,
  filtered,
  generateNotes,
  findNoteListItemVariants,
  clear,
  setOrder,
  addCoAuthor,
  findListItemVariants,
  removeNote,
}
