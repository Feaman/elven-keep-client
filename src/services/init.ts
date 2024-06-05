import { AxiosError } from 'axios'
import noteModel, { TNote } from '~/composables/models/note'
import NotesService from '~/composables/services/notes'
import StatusesService from '~/composables/services/statuses'
import TypesService from '~/composables/services/types'
import { ROUTE_EXISTED_NOTE, ROUTE_NOTES } from '~/router/routes'
import BaseService from '~/services//base'
import ApiService, { ConfigObject } from '~/services/api/api'
import { useGlobalStore } from '~/stores/global'
import StorageService from './storage'

export default class InitService extends BaseService {
  static async initApplication(data: ConfigObject | undefined = undefined): Promise<void> {
    const globalStore = useGlobalStore()

    try {
      globalStore.isInitDataLoading = true
      if (!data) {
        data = await ApiService.getConfig()
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
        const noteData = await ApiService.getNote(Number(NotesService.currentNote.value.id))
        await NotesService.updateNote(NotesService.currentNote.value, noteData)
      } else {
        const data = await ApiService.getConfig()
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
        const serverData = await ApiService.getConfig()
        const notes: TNote[] = []

        // Apply statuses and types without checking
        StatusesService.generateStatuses(offlineData.statuses)
        TypesService.generateTypes(offlineData.types)

        // Handle notes
        offlineData.notes.forEach((offlineNote: TNote) => {
          const serverNote = serverData.notes.find((serverNote) => serverNote.id === offlineNote.id)
          if (!serverNote) {
            noteModel(offlineNote).save()
          } else {
            if (!offlineNote.updated || !offlineNote.created) {
              throw new Error('"updated" or "created" field not found in offline note')
            }
            if ((new Date(offlineNote.updated)) < (new Date(serverNote.updated))) {
              Object.assign(offlineNote, serverNote)
            } else if ((new Date(offlineNote.updated)) > (new Date(serverNote.updated))) {
              NotesService.updateNote(offlineNote)
            }
            serverData.notes.splice(serverData.notes.indexOf(serverNote), 1)
          }

          // if (offlineNote.typeId === TypesService.findByName(TYPE_TEXT).id) {
          // } else {
          // if (noteData.typeId === TypesService.findByName(TYPE_TEXT).id) {
          // Object.assign(note, noteData)
          // } else {
          // note.title = noteData.title || ''
          // let listData: TListItem[] = []
          // if (noteData.list) {
          //   listData = noteData.list
          //   delete noteData.list
          // }
          // Object.assign(note, noteData)

          // // Handle list update
          // listData.forEach(async (listItemData) => {
          //   listItemData.checked = !!listItemData.checked
          //   listItemData.completed = !!listItemData.completed
          //   const existedListItem = note?.list.find((listItem) => listItem.id === listItemData.id)
          //   if (existedListItem) {
          //     Object.assign(existedListItem, listItemData)
          //     existedListItem.handleDataTransformation()
          //   } else if (note) {
          //     ListItemsService.addListItem(note, listItemData)
          //   }
          // })

          // // Handle deleted list items
          // const listItemsToDelete: number[] = []
          // note.list.forEach((listItem) => {
          //   const existedListItem = listData.find((listItemData) => listItem.id === listItemData.id)
          //   if (!existedListItem && listItem.id) {
          //     listItemsToDelete.push(listItem.id)
          //   }
          // })
          // note.list = note.list.filter((listItem) => listItem.id && !listItemsToDelete.includes(listItem.id))
          // }
          // }

          notes.push(offlineNote)
        })

        NotesService.generateNotes(notes)
      } finally {
        globalStore.isUpdating = false
      }
    }
  }
}
