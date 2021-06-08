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
    const variants: Variant[] = []

    if (query.length > 1) {
      const ownNote = this.vuex.state.notes.find((note: NoteModel) => note.id === listItem.noteId)
      this.findNoteListItemVariants(ownNote, variants, listItem, query)

      this.vuex.state.notes.forEach((note: NoteModel) => {
        if (note.id !== ownNote.id && note.isList()) {
          this.findNoteListItemVariants(note, variants, listItem, query)
        }
      })
    }

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
              variants.push({ noteId: Number(_listItem.noteId), listItemId: Number(_listItem.id), text: _listItem.text, isExists })
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
}
