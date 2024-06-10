import { TListItem } from '~/composables/models/list-item'
import { TNote } from '~/composables/models/note'
import NotesService from '~/composables/services/notes'
import StatusesService from '~/composables/services/statuses'
import TypesService from '~/composables/services/types'
import { ROUTE_EXISTED_NOTE, ROUTE_NEW } from '~/router/routes'
import { useGlobalStore } from '~/stores/global'
import { ConfigObject } from './api/interface'
import OnlineApiService from './api/online-api'
import BaseService from './base'
import InitService from './init'
import StorageService from './storage'

export default class SyncService extends BaseService {
  static async synchronizeOfflineData(data?: ConfigObject) {
    const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME)
    const onlineApi = new OnlineApiService()

    this.clearRemovedOfflineNotesAndListItems()

    const globalStore = useGlobalStore()
    globalStore.isUpdating = true
    try {
      const serverData = data || await BaseService.api.getConfig()

      if (!data) {
        TypesService.generateTypes(serverData.types)
        StatusesService.generateStatuses(serverData.statuses)
      }

      // Apply statuses and types without checking
      offlineData.statuses = serverData.statuses
      offlineData.types = serverData.types

      // Handle offline notes
      for (let noteIndex = 0; noteIndex < offlineData.notes.length; noteIndex++) {
        const offlineNote = offlineData.notes[noteIndex] as TNote

        // Handle Note entity
        const serverNote = serverData.notes.find((serverNote) => serverNote.id === offlineNote.id)
        if (!serverNote) {
          if (String(offlineNote.id).indexOf('offline') === 0) {
          // Create Note
            // eslint-disable-next-line no-await-in-loop
            const newNote = await onlineApi.addNote(
              offlineNote.list || [],
              offlineNote.title || '',
              offlineNote.text || '',
              offlineNote.typeId || 0,
              offlineNote.order,
              !!offlineNote.isCompletedListExpanded,
            )
            offlineNote.id = newNote.id
            if ([ROUTE_EXISTED_NOTE, ROUTE_NEW].includes(String(this.router.currentRoute.value.name))) {
              window.history.replaceState({}, '', `/note/${newNote.id}`)
              if (NotesService.currentNote.value?.id) {
                NotesService.currentNote.value.id = newNote.id
              }
            }

            // Create list items
            if (offlineNote.list) {
              offlineNote.list.forEach((offlineListItem) => {
                offlineListItem.noteId = newNote.id
                onlineApi.addListItem(offlineListItem)
              })
            }
          } else {
            offlineData.notes.splice(noteIndex, 1)
          }

          // eslint-disable-next-line no-continue
          continue
        } else {
          if (!offlineNote.updated || !serverNote.updated) {
            throw new Error('"updated" or "created" field not found in offline note')
          }
          if ((new Date(offlineNote.updated)) < (new Date(serverNote.updated))) {
            Object.assign(offlineNote, serverNote)
          } else if ((new Date(offlineNote.updated)) > (new Date(serverNote.updated))) {
            onlineApi.updateNote(
              Number(offlineNote.id),
              offlineNote.title || '',
              offlineNote.text || '',
              Number(offlineNote.typeId),
              !!offlineNote.isCompletedListExpanded,
            )
          }
        }

        // Handle offline list items
        if (offlineNote.list) {
          for (let listItemIndex = 0; listItemIndex < offlineNote.list.length; listItemIndex++) {
            const offlineListItem = offlineNote.list[listItemIndex]
            const serverListItem = serverNote?.list && serverNote.list.find((listItem) => listItem.id === offlineListItem.id)
            if (!serverListItem) {
              if (String(offlineListItem.id).indexOf('offline') === 0) {
                // eslint-disable-next-line no-await-in-loop
                const newListItem = await onlineApi.addListItem(offlineListItem)
                offlineListItem.id = newListItem.id
              } else {
                offlineNote.list.splice(listItemIndex, 1)
              }
            } else {
              if (!offlineListItem.updated || !serverListItem.updated) {
                throw new Error('"updated" or "created" field not found in offline note')
              }
              if ((new Date(offlineListItem.updated)) < (new Date(serverListItem.updated))) {
                Object.assign(offlineListItem, serverListItem)
              } else if ((new Date(offlineListItem.updated)) > (new Date(serverListItem.updated))) {
                onlineApi.updateListItem(offlineListItem)
              }
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
      }

      // Handle online notes
      const offlineNoteIds = offlineData.notes.map((offlineNote: TNote) => offlineNote.id)
      const newNotes = serverData.notes.filter((serverNote) => !offlineNoteIds.includes(serverNote.id))
      newNotes.forEach((serverNote) => {
        offlineData.notes.push(serverNote)
      })

      StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })
      if (!data) {
        NotesService.generateNotes(offlineData.notes)
      }
    } finally {
      setTimeout(() => {
        globalStore.isUpdating = false
      }, 1000)
    }
  }

  static clearRemovedOfflineNotesAndListItems() {
    const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME)
    const offlineNotesIndicesToRemove: number[] = []
    const offlineListItemsIndicesToRemove: number[] = []
    offlineData.notes.forEach((offlineNote: TNote, index: number) => {
      if (
        offlineNote.statusId === StatusesService.inactive.value.id
        && ((new Date()).getTime() - (new Date(String(offlineNote.updated))).getTime() > 5000)
      ) {
        offlineNotesIndicesToRemove.push(index)
      } else if (offlineNote.list) {
        offlineNote.list.forEach((offlineListItem) => {
          if (
            offlineListItem.statusId === StatusesService.inactive.value.id
        && ((new Date()).getTime() - (new Date(String(offlineListItem.updated))).getTime() > 5000)
          ) {
            offlineListItemsIndicesToRemove.push(index)
          }
        })
      }
    })
    offlineNotesIndicesToRemove.forEach((offlineNoteIndex) => offlineData.notes.splice(offlineNoteIndex, 1))
    offlineListItemsIndicesToRemove.forEach((offlineListItemIndex) => offlineData.notes.splice(offlineListItemIndex, 1))

    StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })
  }

  static async handleApplicationUpdate() {
    const globalStore = useGlobalStore()

    if (!globalStore.isOnline) {
      return
    }

    globalStore.isUpdating = true
    try {
      await InitService.initApplication()
      if (
        [ROUTE_EXISTED_NOTE, ROUTE_NEW].includes(String(this.router.currentRoute.value.name))
        && NotesService.currentNote.value
      ) {
        const currentNote = NotesService.notes.value.find((note) => note.id === NotesService.currentNote.value?.id)
        if (!currentNote) {
          throw new Error('Current note id not found in new notes')
        }
        NotesService.currentNote.value = currentNote
      }
    } finally {
      globalStore.isSocketErrorOnce = false
      globalStore.isUpdating = false
    }
  }
}
