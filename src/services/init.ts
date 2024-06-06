import { AxiosError } from 'axios'
import { TListItem } from '~/composables/models/list-item'
import { TNote } from '~/composables/models/note'
import ListItemsService from '~/composables/services/list-items'
import NotesService from '~/composables/services/notes'
import StatusesService from '~/composables/services/statuses'
import TypesService from '~/composables/services/types'
import { ROUTE_EXISTED_NOTE, ROUTE_NEW, ROUTE_NOTES } from '~/router/routes'
import BaseService from '~/services//base'
import { useGlobalStore } from '~/stores/global'
import { ConfigObject } from './api/interface'
import StorageService from './storage'

export default class InitService extends BaseService {
  static async initApplication(data: ConfigObject | undefined = undefined): Promise<void> {
    const globalStore = useGlobalStore()

    try {
      globalStore.isInitDataLoading = true
      if (!data) {
        data = await BaseService.api.getConfig()
      }

      StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: data })

      TypesService.generateTypes(data.types)
      StatusesService.generateStatuses(data.statuses)
      NotesService.generateNotes(data.notes)

      globalStore.setUser(data.user)
    } catch (error) {
      globalStore.initError = BaseService.parseAxiosError(error as AxiosError)
    } finally {
      globalStore.isInitDataLoading = false
    }
  }

  static async handleApplicationUpdate() {
    if (![ROUTE_NOTES, ROUTE_EXISTED_NOTE].includes(String(this.router.currentRoute.value.name))) {
      return
    }

    const globalStore = useGlobalStore()
    globalStore.isUpdating = true
    try {
      if (this.router.currentRoute.value.name === ROUTE_EXISTED_NOTE && NotesService.currentNote.value) {
        const noteData = await BaseService.api.getNote(Number(NotesService.currentNote.value.id))
        await NotesService.updateNote(NotesService.currentNote.value, noteData)
      } else {
        const data = await BaseService.api.getConfig()
        this.initApplication(data)
      }
    } finally {
      globalStore.isSocketErrorOnce = false
      globalStore.isUpdating = false
    }
  }

  static clearApplication() {
    const globalStore = useGlobalStore()
    NotesService.notes.value = []
    globalStore.user = null
  }

  static async synchronizeOfflineData() {
    const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME)

    if (offlineData) {
      const globalStore = useGlobalStore()
      globalStore.isUpdating = true
      try {
        const serverData = await BaseService.api.getConfig()
        const notes: TNote[] = []

        // Apply statuses and types without checking
        StatusesService.generateStatuses(offlineData.statuses)
        TypesService.generateTypes(offlineData.types)

        // Handle offline notes
        for (let noteIndex = 0; noteIndex < offlineData.notes.length; noteIndex++) {
          const offlineNote = offlineData.notes[noteIndex] as TNote

          // Handle Note entity
          const note = NotesService.notes.value.find((note) => note.id === offlineNote.id)
          if (!note) {
            throw new Error(`Note with offline id ${offlineNote.id} not found`)
          }
          let serverNote = serverData.notes.find((serverNote) => serverNote.id === note.id)

          // If only offline notes marked as deleted
          if (!serverNote && offlineNote.statusId === StatusesService.inactive.value.id) {
            offlineData.notes.splice(noteIndex, 1)
            // eslint-disable-next-line no-continue
            continue
          }

          if (!serverNote) {
            note.id = undefined
            // eslint-disable-next-line no-await-in-loop
            await note.save(this.router.currentRoute.value.name === ROUTE_NEW)
            if (note.id) {
              offlineNote.id = note.id
            }
            serverNote = { ...offlineNote }
            serverNote.list = []
            serverData.notes.push(serverNote)
            offlineData.notes.push(offlineNote)
          } else {
            if (!offlineNote.updated || !serverNote.updated) {
              throw new Error('"updated" or "created" field not found in offline note')
            }
            if ((new Date(offlineNote.updated)) < (new Date(serverNote.updated))) {
              Object.assign(note, serverNote)
              Object.assign(offlineNote, serverNote)
            } else if ((new Date(offlineNote.updated)) > (new Date(serverNote.updated))) {
              // eslint-disable-next-line no-await-in-loop
              await note.save()
            }
            serverData.notes.splice(serverData.notes.indexOf(serverNote), 1)
          }

          // Handle offline list items
          if (offlineNote.list) {
            for (let listItemIndex = 0; listItemIndex < offlineNote.list.length; listItemIndex++) {
              const offlineListItem = offlineNote.list[listItemIndex]
              offlineListItem.checked = !!offlineListItem.checked
              offlineListItem.completed = !!offlineListItem.completed
              const listItem = note.list.find((listItem) => listItem.id === offlineListItem.id)
              if (!listItem) {
                throw new Error(`List item with id ${offlineListItem.id} not found`)
              }
              const serverListItemData = serverNote?.list && serverNote.list.find((listItem) => listItem.id === offlineListItem.id)
              if (serverListItemData) {
                if (!offlineListItem.updated || !serverListItemData.updated) {
                  throw new Error('"updated" or "created" field not found in offline note')
                }
                // Object.assign(existedListItem, listItemData)
                if ((new Date(offlineListItem.updated)) < (new Date(serverListItemData.updated))) {
                  Object.assign(listItem, serverListItemData)
                  Object.assign(offlineListItem, serverListItemData)
                  listItem.handleDataTransformation()
                } else if ((new Date(offlineListItem.updated)) > (new Date(serverListItemData.updated))) {
                  offlineListItem.id = undefined
                  // eslint-disable-next-line no-await-in-loop
                  const newListItem = await ListItemsService.addListItem(note, offlineListItem)
                  offlineListItem.id = newListItem.id.value
                }
              } else if (note) {
                ListItemsService.addListItem(note, offlineListItem)
                // note.saveListItem(listItem)
              }
            }

            // Handle online list items
            if (serverNote?.list) {
              const offlineListItemsIds = offlineNote.list.map((offlineNoteListItem: TListItem) => offlineNoteListItem.id)
              const newListItems = serverNote.list.filter((serverNoteListItem) => !offlineListItemsIds.includes(serverNoteListItem.id))
              newListItems.forEach((newListItem) => {
                if (offlineNote.list) {
                  offlineNote.list.push(newListItem)
                }
              })
            }
          }
          notes.push(offlineNote)
        }

        // Handle online notes
        const offlineNoteIds = offlineData.notes.map((offlineNote: TNote) => offlineNote.id)
        const newNotes = serverData.notes.filter((serverNote) => !offlineNoteIds.includes(serverNote.id))
        newNotes.forEach((serverNote) => {
          offlineData.notes.push(serverNote)
          notes.push(serverNote)
        })

        NotesService.generateNotes(notes)
        StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })
      } finally {
        globalStore.isUpdating = false
      }
    }
  }
}
