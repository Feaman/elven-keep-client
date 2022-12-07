import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import useNoteStore, { INote, NoteModel } from '~/stores/models/note'
import { useStatusesStore } from './statuses'
import BaseService from '~/services/base'
import { ListItemModel, Variant } from './models/list-item'
import { CoAuthorModel, useCoAuthorStore } from './models/co-author'

export const useNotesStore = defineStore('notes', () => {
  const notes: Ref<NoteModel[]> = ref([])
  const statusesStore = useStatusesStore()
  const { api } = BaseService

  function generateNotes(notesData: INote[]) {
    notesData.forEach((noteData: INote) => {
      const note = useNoteStore(noteData)
      // note.setNoteToListItems()
      notes.value.push(note)
    })
  }

  function findNoteListItemVariants(note: NoteModel, variants: Variant[], listItem: ListItemModel, query: string) {
    note.list
      .filter((_listItem) => _listItem !== listItem && _listItem.statusId !== statusesStore.getInActive().id)
      .forEach((_listItem) => {
        if (
          _listItem.text?.toLowerCase().includes(query)
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
      variant.highlightedText = variant.text.replace(regexp, (text) => `<span class="green--text">${text}</span>`)
    })

    return resultVariants
  }

  function addNoteCoAuthor(note: NoteModel, coAuthor: CoAuthorModel) {
    note.addCoAuthor(coAuthor)
  }

  async function addCoAuthor(note: NoteModel, email: string) {
    const noteCoAuthorData = await api.addNoteCoAuthor(note, email)
    addNoteCoAuthor(note, useCoAuthorStore(noteCoAuthorData))
  }

  function setOrder(note: NoteModel, order: number[]) {
    api.setOrder(note, order)
  }

  function clear() {
    notes.value.forEach((note: NoteModel) => {
      note.list.forEach((listItem) => {
        if (listItem.statusId === statusesStore.getInActive().id) {
          // listItem.removeFromState()
        }
      })
      if (note.statusId === statusesStore.getInActive().id) {
        // note.removeFromState()
      }
    })
  }

  return {
    notes,
    generateNotes,
    findNoteListItemVariants,
    clear,
    setOrder,
    addCoAuthor,
    findListItemVariants,
  }
})
