import ApiService from './api'
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
    return this.vuex.dispatch('setNotes', notes)
  }

  static findListItemVariants (listItem: ListItemModel, query: string) {
    let variants: Variant[] = []

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

    // Unique
    variants = variants.filter((element, position) => {
      const sameElement = variants.find((_element) => _element.text === element.text)
      return sameElement ? variants.indexOf(sameElement) === position : false
    })

    return variants
  }

  static findNoteListItemVariants (note: NoteModel, variants: Variant[], listItem: ListItemModel, query: string) {
    if (query.length > 1) {
      if (note.isList()) {
        note.list
          .filter(_listItem => _listItem !== listItem)
          .forEach((_listItem: ListItemModel) => {
            if (
              _listItem.text?.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) === 0 &&
              !variants.find(variant => variant.listItemId === _listItem.id)
            ) {
              const isExists = listItem.noteId === note.id && !_listItem.completed
              variants.push({
                noteId: Number(_listItem.noteId),
                listItemId: Number(_listItem.id),
                text: _listItem.text,
                isExists,
                focused: false,
              })
            }
          })
      }
    }
  }

  static addCoAuthor (note: NoteModel, email: string) {
    return this.api.addNoteCoAuthor(note, email)
      .then((coAuthorData: ICoAuthor) => {
        return this.vuex.dispatch('addNoteCoAuthor', { note, noteCoAuthor: new CoAuthorModel(coAuthorData) })
      })
  }

  static setOrder (note: NoteModel, order: number[]) {
    ApiService.setOrder(note, order)
  }
}
