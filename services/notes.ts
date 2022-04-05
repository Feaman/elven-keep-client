import ApiService from './api'
import StatusesService from './statuses'
import BaseService from '~/services/base'
import NoteModel, { INote } from '~/models/note'
import ListItemModel, { Variant } from '~/models/list-item'
import CoAuthorModel, { ICoAuthor } from '~/models/co-author'

export default class NotesService extends BaseService {
  static generateNotes (notesData: INote[]) {
    const notes: Array<NoteModel> = []
    notesData.forEach((noteData: INote) => {
      const note = new NoteModel(noteData)
      note.setNoteToListItems()
      notes.push(note)
    })
    this.vuex.commit('setNotes', notes)
  }

  static findListItemVariants (listItem: ListItemModel, query: string) {
    const variants: Variant[] = []
    query = query.toLocaleLowerCase()

    if (query.length > 1) {
      this.vuex.state.notes.forEach((note: NoteModel) => {
        if (note.isList()) {
          this.findNoteListItemVariants(note, variants, listItem, query)
        }
      })
    }

    // Sort
    variants.sort((previousItem, nextItem) => {
      if (previousItem.text === nextItem.text) {
        return 0
      } else {
        return previousItem.text > nextItem.text ? -1 : 1
      }
    })

    // Duplicates and unique
    const resultVariants: Variant[] = []
    const regexp = new RegExp(query, 'i')
    variants.forEach((variant) => {
      if (!resultVariants.find(item => item.text.toLowerCase() === variant.text.toLowerCase())) {
        const duplicates = variants.filter((_element) => {
          return variant.listItemId !== _element.listItemId &&
          _element.text.toLowerCase() === variant.text.toLowerCase()
        })
        variant.duplicatesQuantity = duplicates.length
        resultVariants.push(variant)
      }
    })

    // Highlight
    variants.forEach((variant) => {
      variant.text = variant.text.replace(regexp, text => `<span class="green--text">${text}</span>`)
    })

    return resultVariants
  }

  static findNoteListItemVariants (note: NoteModel, variants: Variant[], listItem: ListItemModel, query: string) {
    note.list
      .filter(_listItem => _listItem !== listItem && _listItem.statusId !== StatusesService.getInActive().id)
      .forEach((_listItem: ListItemModel) => {
        if (
          _listItem.text?.toLowerCase().includes(query) &&
          !variants.find(variant => variant.listItemId === _listItem.id)
        ) {
          const isExists = listItem.noteId === note.id && !_listItem.completed
          variants.push({
            noteId: Number(_listItem.noteId),
            listItemId: Number(_listItem.id),
            text: _listItem.text.trim(),
            isExists,
            focused: false,
          })
        }
      })
  }

  static addCoAuthor (note: NoteModel, email: string) {
    return this.api.addNoteCoAuthor(note, email)
      .then((coAuthorData: ICoAuthor) => {
        this.vuex.commit('addNoteCoAuthor', { note, noteCoAuthor: new CoAuthorModel(coAuthorData) })
      })
  }

  static setOrder (note: NoteModel, order: number[]) {
    ApiService.setOrder(note, order)
  }

  static clear () {
    this.vuex.state.notes.forEach((note: NoteModel) => {
      note.list.forEach(listItem => {
        if (listItem.statusId === StatusesService.getInActive().id) {
          listItem.removeFromState()
        }
      })
      if (note.statusId === StatusesService.getInActive().id) {
        note.removeFromState()
      }
    })
  }
}
