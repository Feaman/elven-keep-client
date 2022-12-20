import BaseService from '~/services/base'
import NoteModel from '~/models/note'
import ListItemModel, { IListItem } from '~/models/list-item'
import NotesService from '~/services/notes'

export default class SSEService extends BaseService {
  static EVENT_NOTE_ADDED = 'EVENT_NOTE_ADDED'

  static EVENT_NOTE_CHANGED = 'EVENT_NOTE_CHANGED'

  static EVENT_NOTE_REMOVED = 'EVENT_NOTE_REMOVED'

  static EVENT_NOTE_ORDER_SET = 'EVENT_NOTE_ORDER_SET'

  static EVENT_LIST_ITEM_CHANGED = 'EVENT_LIST_ITEM_CHANGED'

  static EVENT_LIST_ITEM_REMOVED = 'EVENT_LIST_ITEM_REMOVED'

  static EVENT_LIST_ITEM_ADDED = 'EVENT_LIST_ITEM_ADDED'

  static eventSource: EventSource | null = null

  static init() {
    this.eventSource = new EventSource(`${this.api.URL}events/${this.vuex.state.user.id}/${this.vuex.state.SSESalt}`)

    this.eventSource.onerror = function (event: Event) {
      const target = event.target as WebSocket
      switch (target.readyState) {
        case EventSource.CONNECTING:
          console.log('Reconnecting...')
          break

        case EventSource.CLOSED:
          console.log('Connection failed, will not reconnect')
          break
      }
    }

    this.eventSource.addEventListener(this.EVENT_NOTE_ADDED, (sourceEvent: Event) => {
      const event = sourceEvent as MessageEvent
      const noteData = JSON.parse(event.data)
      const note = new NoteModel(noteData)
      NotesService.vuex.commit('addNote', note)
    })

    this.eventSource.addEventListener(this.EVENT_NOTE_CHANGED, (sourceEvent: Event) => {
      const event = sourceEvent as MessageEvent
      const noteData = JSON.parse(event.data)
      const note = this.vuex.state.notes.find((note: NoteModel) => note.id === noteData.id)
      if (note) {
        note.updateState({ title: noteData.title, text: noteData.text, isCompletedListExpanded: noteData.isCompletedListExpanded })
      }
    })

    this.eventSource.addEventListener(this.EVENT_NOTE_ORDER_SET, (sourceEvent: Event) => {
      const event = sourceEvent as MessageEvent
      const noteData = JSON.parse(event.data)
      const note = this.vuex.state.notes.find((note: NoteModel) => note.id === noteData.id) as NoteModel
      if (note && note.isList) {
        noteData.list.forEach((listItemData: IListItem) => {
          const listItem = note.list.find((listItem) => listItem.id === listItemData.id)
          if (listItem) {
            listItem.updateState({ order: listItemData.order })
          }
        })
      }
    })

    this.eventSource.addEventListener(this.EVENT_NOTE_REMOVED, (sourceEvent: Event) => {
      const event = sourceEvent as MessageEvent
      const noteData = JSON.parse(event.data)
      const note: NoteModel = this.vuex.state.notes.find((note: NoteModel) => note.id === noteData.id)
      if (!note) {
        return
      }
      note.removeFromState()
      this.events.$emit('NOTE_REMOVED', note)
    })

    this.eventSource.addEventListener(this.EVENT_LIST_ITEM_ADDED, (sourceEvent: Event) => {
      const event = sourceEvent as MessageEvent
      const listItemData = JSON.parse(event.data)
      const note: NoteModel = this.vuex.state.notes.find((note: NoteModel) => note.id === listItemData.noteId)
      if (note) {
        note.addListItem(listItemData)
      }
    })

    this.eventSource.addEventListener(this.EVENT_LIST_ITEM_CHANGED, (sourceEvent: Event) => {
      const event = sourceEvent as MessageEvent
      const listItemData = JSON.parse(event.data)
      const note: NoteModel = this.vuex.state.notes.find((note: NoteModel) => note.id === listItemData.noteId)
      if (note) {
        const listItem = note.list.find((listItem: ListItemModel) => listItem.id === listItemData.id)
        if (listItem) {
          listItem.updateState({ text: listItemData.text, checked: listItemData.checked, completed: listItemData.completed })
        }
      }
    })

    this.eventSource.addEventListener(this.EVENT_LIST_ITEM_REMOVED, (sourceEvent: Event) => {
      const event = sourceEvent as MessageEvent
      const listItemData = JSON.parse(event.data)
      const note = this.vuex.state.notes.find((note: NoteModel) => note.id === listItemData.noteId)
      if (note) {
        const listItem: ListItemModel = note.list.find((listItem: ListItemModel) => listItem.id === listItemData.id)
        if (listItem) {
          listItem.removeFromState()
        }
      }
    })
  }
}
