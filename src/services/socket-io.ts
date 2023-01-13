import { io } from 'socket.io-client'
import listItemModel, { TListItem, TListItemModel } from '~/composables/models/list-item'
import NotesService from '~/composables/services/notes'
import BaseService from './base'
import StorageService from './storage'
import UsersService from '~/composables/services/users'
import noteModel, { TNote, TNoteModel } from '~/composables/models/note'
import { ROUTE_EXISTED_NOTE } from '~/router/routes'
import { useGlobalStore } from '~/stores/global'

export default class SocketIOService extends BaseService {
  static EVENT_NOTE_ADDED = 'EVENT_NOTE_ADDED'

  static EVENT_NOTE_CHANGED = 'EVENT_NOTE_CHANGED'

  static EVENT_NOTE_REMOVED = 'EVENT_NOTE_REMOVED'

  static EVENT_NOTE_ORDER_SET = 'EVENT_NOTE_ORDER_SET'

  static EVENT_LIST_ITEM_CHANGED = 'EVENT_LIST_ITEM_CHANGED'

  static EVENT_LIST_ITEM_REMOVED = 'EVENT_LIST_ITEM_REMOVED'

  static EVENT_LIST_ITEM_ADDED = 'EVENT_LIST_ITEM_ADDED'

  static socketId: string

  static init() {
    // const socket = io('api.notes.pavlo.ru', { auth: 'asdf', transports: ['polling'] })
    const token = StorageService.get(UsersService.AUTH_TOKEN_NAME)
    const socket = io('api.notes.pavlo.ru', { extraHeaders: { Authorization: `Bearer ${token}` } })

    socket.on('connect', () => {
      this.socketId = socket.id
      const globalStore = useGlobalStore()
      globalStore.isSocketError = false
    })

    socket.on('connect_error', (error) => {
      const globalStore = useGlobalStore()
      globalStore.isSocketError = true
      globalStore.isSocketErrorOnce = true
      // eslint-disable-next-line
      console.error(error)
    })

    socket.on(this.EVENT_LIST_ITEM_CHANGED, (listItemData: TListItem) => {
      const note = NotesService.notes.value.find((note) => note.id === listItemData.noteId)
      if (note) {
        const listItem = note.list.find((listItem) => listItem.id === listItemData.id)
        if (listItem) {
          Object.assign(listItem, { text: listItemData.text, checked: listItemData.checked, completed: listItemData.completed })
        }
      }
    })

    socket.on(this.EVENT_NOTE_ADDED, (noteData: TNote) => {
      const note = noteModel(noteData)
      NotesService.notes.value.push(note as unknown as TNoteModel)
    })

    socket.on(this.EVENT_NOTE_CHANGED, (noteData: TNote) => {
      const note = NotesService.notes.value.find((note) => note.id === noteData.id)
      if (note) {
        Object.assign(
          note,
          {
            title: noteData.title,
            text: noteData.text,
            isCompletedListExpanded: noteData.isCompletedListExpanded,
            order: noteData.order,
          },
        )
      }
    })

    socket.on(this.EVENT_NOTE_ORDER_SET, (noteData: TNote) => {
      const note = NotesService.notes.value.find((_note) => _note.id === noteData.id) as TNoteModel
      if (note && note.isList) {
        noteData.list?.forEach((listItemData: TListItem) => {
          const listItem = note.list.find((listItem) => listItem.id === listItemData.id) as TListItemModel
          if (listItem) {
            listItem.order = Number(listItemData.order)
          }
        })
      }
    })

    socket.on(this.EVENT_NOTE_REMOVED, (noteData: TNote) => {
      const note = NotesService.notes.value.find((note) => note.id === noteData.id)
      if (note) {
        NotesService.notes.value = NotesService.notes.value.filter((_note) => _note.id !== note.id)
      }
      if (this.router.currentRoute.value.name === ROUTE_EXISTED_NOTE) {
        this.router.push('/')
      }
    })

    socket.on(this.EVENT_LIST_ITEM_ADDED, (listItemData: TListItem) => {
      const note = NotesService.notes.value.find((note) => note.id === listItemData.noteId)
      if (note) {
        note.addListItem(listItemModel(listItemData) as unknown as TListItemModel)
      }
    })

    socket.on(this.EVENT_LIST_ITEM_REMOVED, (listItemData: TListItem) => {
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
