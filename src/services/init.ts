import { AxiosError } from 'axios'
import { TListItem } from '~/composables/models/list-item'
import { TNote } from '~/composables/models/note'
import ListItemsService from '~/composables/services/list-items'
import NotesService from '~/composables/services/notes'
import StatusesService from '~/composables/services/statuses'
import TypesService from '~/composables/services/types'
import { ROUTE_EXISTED_NOTE, ROUTE_NOTES } from '~/router/routes'
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

        // Handle notes
        offlineData.notes.forEach((offlineNote: TNote) => {
          // Handle Note entity
          const note = NotesService.notes.value.find((note) => note.id === offlineNote.id)
          if (!note) {
            throw new Error(`Note with offline id ${offlineNote.id} not found`)
          }
          const serverNote = serverData.notes.find((serverNote) => serverNote.id === note.id)
          if (!serverNote) {
            note.id = undefined
            note.save()
          } else {
            if (!offlineNote.updated || !serverNote.updated) {
              throw new Error('"updated" or "created" field not found in offline note')
            }
            if ((new Date(offlineNote.updated)) < (new Date(serverNote.updated))) {
              Object.assign(note, serverNote)
              Object.assign(offlineNote, serverNote)
            } else if ((new Date(offlineNote.updated)) > (new Date(serverNote.updated))) {
              note.save()
            }
            serverData.notes.splice(serverData.notes.indexOf(serverNote), 1)
          }

          // Handle List_Items entity
          let listData: TListItem[] = []
          if (offlineNote.list) {
            listData = offlineNote.list
            delete offlineNote.list
          }
          // Object.assign(note, noteData)

          // Handle list update
          listData.forEach(async (offlineListItemData) => {
            offlineListItemData.checked = !!offlineListItemData.checked
            offlineListItemData.completed = !!offlineListItemData.completed
            const listItem = note.list.find((listItem) => listItem.id === offlineListItemData.id)
            if (!listItem) {
              throw new Error(`List item with id ${offlineListItemData.id} not found`)
            }
            const serverListItemData = serverNote?.list && serverNote.list.find((listItem) => listItem.id === offlineListItemData.id)
            if (serverListItemData) {
              if (!offlineListItemData.updated || !serverListItemData.updated) {
                throw new Error('"updated" or "created" field not found in offline note')
              }
              // Object.assign(existedListItem, listItemData)
              if ((new Date(offlineListItemData.updated)) < (new Date(serverListItemData.updated))) {
                Object.assign(listItem, serverListItemData)
                Object.assign(offlineListItemData, serverListItemData)
                listItem.handleDataTransformation()
              } else if ((new Date(offlineListItemData.updated)) > (new Date(serverListItemData.updated))) {
                note.save()
              }
            } else if (note) {
              ListItemsService.addListItem(note, offlineListItemData)
              note.saveListItem(listItem)
            }
          })

          // Handle deleted list items
          // const listItemsToDelete: number[] = []
          // note.list.forEach((listItem) => {
          //   const existedListItem = listData.find((listItemData) => listItem.id === listItemData.id)
          //   if (!existedListItem && listItem.id) {
          //     listItemsToDelete.push(listItem.id)
          //   }
          // })
          // note.list = note.list.filter((listItem) => listItem.id && !listItemsToDelete.includes(listItem.id))
        })

        NotesService.generateNotes(notes)
        StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: offlineData })
      } finally {
        globalStore.isUpdating = false
      }
    }
  }
}
