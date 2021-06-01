import BaseService from '~/services/base'
import NoteModel, { NoteDataObject } from '~/models/note'
import ListItemModel from '~/models/list-item'
import CoAuthorModel, { CoAuthorDataObject } from '~/models/co-author'

export default class NotesService extends BaseService {
  static generateNotes (notesData: NoteDataObject[]) {
    const notes: Array<NoteModel> = []
    notesData.forEach((noteData: NoteDataObject) => {
      const note = new NoteModel(noteData)
      note.setNoteToListItems()
      notes.push(note)
    })
    return this.vuex.dispatch('setNotes', notes)
  }

  static findListItemVariants (listItem: ListItemModel, query: string) {
    const variants: string[] = []

    if (query.length > 1) {
      this.vuex.state.notes.forEach((note: NoteModel) => {
        if (note.isList()) {
          note.list
            .filter(_listItem => _listItem !== listItem)
            .forEach(listItem => {
              if (
                listItem.text?.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) === 0 &&
                listItem.text !== query
              ) {
                variants.push(listItem.text)
              }
            })
        }
      })
    }

    return variants
  }

  static addCoAuthor (note: NoteModel, email: string) {
    return this.api.addNoteCoAuthor(note, email)
      .then((coAuthorData: CoAuthorDataObject) => {
        return this.vuex.dispatch('addNoteCoAuthor', { note, noteCoAuthor: new CoAuthorModel(coAuthorData) })
      })
  }

  static removeCoAuthor (note: NoteModel, email: string) {
    return this.api.addNoteCoAuthor(note, email)
  }
}
