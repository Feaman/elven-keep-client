import { AxiosError } from 'axios'
import { TListItem } from '~/composables/models/list-item'
import { TNote } from '~/composables/models/note'
import NotesService from '~/composables/services/notes'
import StatusesService from '~/composables/services/statuses'
import TypesService from '~/composables/services/types'
import { ROUTE_EXISTED_NOTE, ROUTE_NEW, ROUTE_NOTES } from '~/router/routes'
import BaseService from '~/services//base'
import { useGlobalStore } from '~/stores/global'
import { ConfigObject } from './api/interface'
import OnlineApiService from './api/online-api'
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
    const onlineApi = new OnlineApiService()

    if (offlineData) {
      const globalStore = useGlobalStore()
      globalStore.isUpdating = true
      try {
        const serverData = await BaseService.api.getConfig(true)

        // Apply statuses and types without checking
        offlineData.statuses = serverData.statuses
        offlineData.types = serverData.types

        // Handle offline notes
        for (let noteIndex = 0; noteIndex < offlineData.notes.length; noteIndex++) {
          const offlineNote = offlineData.notes[noteIndex] as TNote

          // Handle Note entity
          const serverNote = serverData.notes.find((serverNote) => serverNote.id === offlineNote.id)
          if (!serverNote) {
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
            // eslint-disable-next-line no-continue
            continue
          } else {
            if (!offlineNote.updated || !serverNote.updated) {
              throw new Error('"updated" or "created" field not found in offline note')
            }
            console.log((new Date(offlineNote.updated)), (new Date(serverNote.updated)))
            if ((new Date(offlineNote.updated)) < (new Date(serverNote.updated))) {
              Object.assign(offlineNote, serverNote)
            } else if ((new Date(offlineNote.updated)) > (new Date(serverNote.updated))) {
              // eslint-disable-next-line no-await-in-loop
              await onlineApi.updateNote(
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
                // eslint-disable-next-line no-await-in-loop
                const newListItem = await onlineApi.addListItem(offlineListItem)
                offlineListItem.id = newListItem.id
              } else {
                if (!offlineListItem.updated || !serverListItem.updated) {
                  throw new Error('"updated" or "created" field not found in offline note')
                }
                if ((new Date(offlineListItem.updated)) < (new Date(serverListItem.updated))) {
                  Object.assign(offlineListItem, serverListItem)
                } else if ((new Date(offlineListItem.updated)) > (new Date(serverListItem.updated))) {
                  offlineListItem.id = undefined
                  // eslint-disable-next-line no-await-in-loop
                  const newListItem = await onlineApi.updateListItem(offlineListItem)
                  offlineListItem.id = newListItem.id
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
        window.location.reload()
      } finally {
        setTimeout(() => {
          globalStore.isUpdating = false
        }, 1000)
      }
    }
  }
}
