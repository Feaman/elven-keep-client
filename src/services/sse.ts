import listItemModel, { TListItem, TListItemModel } from '~/composables/models/list-item'
import noteModel, { TNoteModel } from '~/composables/models/note'
import NotesService from '~/composables/services/notes'
import BaseService from '~/services/base'
import { useGlobalStore } from '~/stores/global'

export default class SSEService extends BaseService {
  static EVENT_NOTE_ADDED = 'EVENT_NOTE_ADDED'

  static EVENT_NOTE_CHANGED = 'EVENT_NOTE_CHANGED'

  static EVENT_NOTE_REMOVED = 'EVENT_NOTE_REMOVED'

  static EVENT_NOTE_ORDER_SET = 'EVENT_NOTE_ORDER_SET'

  static EVENT_LIST_ITEM_CHANGED = 'EVENT_LIST_ITEM_CHANGED'

  static EVENT_LIST_ITEM_REMOVED = 'EVENT_LIST_ITEM_REMOVED'

  static EVENT_LIST_ITEM_ADDED = 'EVENT_LIST_ITEM_ADDED'

  static eventSource: EventSource | null = null

  static SSESalt = `_${Math.random().toString(36).substring(2, 9)}_${(new Date()).getMilliseconds()}`

  static init() {
    const globalStore = useGlobalStore()
    this.eventSource = new EventSource(`${BaseService.URL}events/${globalStore.user?.id}/${this.SSESalt}`)

    this.eventSource.onerror = (event: Event) => {
      const target = event.target as WebSocket
      if (target.readyState === EventSource.CONNECTING) {
        console.error('Reconnecting...')
      }

      if (target.readyState === EventSource.CLOSED) {
        console.error('Connection failed, will not reconnect')
      }
    }

    this.eventSource.addEventListener(this.EVENT_NOTE_ADDED, (sourceEvent: Event) => {
      const event = sourceEvent as MessageEvent
      const noteData = JSON.parse(event.data)
      const note = noteModel(noteData)
      note.save()
    })

    this.eventSource.addEventListener(this.EVENT_NOTE_CHANGED, (sourceEvent: Event) => {
      const event = sourceEvent as MessageEvent
      const noteData = JSON.parse(event.data)
      const note = NotesService.notes.value.find((note) => note.id === noteData.id)
      if (note) {
        Object.assign(note, { title: noteData.title, text: noteData.text, isCompletedListExpanded: noteData.isCompletedListExpanded })
      }
    })

    this.eventSource.addEventListener(this.EVENT_NOTE_ORDER_SET, (sourceEvent: Event) => {
      const event = sourceEvent as MessageEvent
      const noteData = JSON.parse(event.data)
      const note = NotesService.notes.value.find((_note) => _note.id === noteData.id) as TNoteModel
      if (note && note.isList) {
        noteData.list.forEach((listItemData: TListItem) => {
          const listItem = note.list.find(() => listItem.id === listItemData.id) as TListItemModel
          if (listItem) {
            listItem.order = Number(listItemData.order)
          }
        })
      }
    })

    this.eventSource.addEventListener(this.EVENT_NOTE_REMOVED, (sourceEvent: Event) => {
      const event = sourceEvent as MessageEvent
      const noteData = JSON.parse(event.data)
      const note = NotesService.notes.value.find((note) => note.id === noteData.id)
      if (!note) {
        return
      }
      NotesService.notes.value = NotesService.notes.value.filter((_note) => _note.id !== note.id)
      // this.events.$emit('NOTE_REMOVED', note)
    })

    this.eventSource.addEventListener(this.EVENT_LIST_ITEM_ADDED, (sourceEvent: Event) => {
      const event = sourceEvent as MessageEvent
      const listItemData = JSON.parse(event.data)
      const note = NotesService.notes.value.find((note) => note.id === listItemData.noteId)
      if (note) {
        note.addListItem(listItemModel(listItemData) as unknown as TListItemModel)
      }
    })

    this.eventSource.addEventListener(this.EVENT_LIST_ITEM_CHANGED, (sourceEvent: Event) => {
      const event = sourceEvent as MessageEvent
      const listItemData = JSON.parse(event.data)
      const note = NotesService.notes.value.find((note) => note.id === listItemData.noteId)
      if (note) {
        const listItem = note.list.find((listItem) => listItem.id === listItemData.id)
        if (listItem) {
          Object.assign(listItem, { text: listItemData.text, checked: listItemData.checked, completed: listItemData.completed })
        }
      }
    })

    this.eventSource.addEventListener(this.EVENT_LIST_ITEM_REMOVED, (sourceEvent: Event) => {
      const event = sourceEvent as MessageEvent
      const listItemData = JSON.parse(event.data)
      const note = NotesService.notes.value.find((note) => note.id === listItemData.noteId)
      if (note) {
        const listItem = note.list.find((listItem) => listItem.id === listItemData.id)
        if (listItem) {
          note.removeListItemSoft(listItem)
        }
      }
    })
  }
}
