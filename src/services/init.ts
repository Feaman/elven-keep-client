import { AxiosError } from 'axios'
import NotesService from '~/composables/services/notes'
import StatusesService from '~/composables/services/statuses'
import TypesService from '~/composables/services/types'
import { ROUTE_EXISTED_NOTE, ROUTE_NOTES } from '~/router/routes'
import BaseService from '~/services//base'
import ApiService, { ConfigObject } from '~/services/api/api'
import { useGlobalStore } from '~/stores/global'

export default class InitService extends BaseService {
  static async initApplication(data: ConfigObject | undefined = undefined): Promise<void> {
    const globalStore = useGlobalStore()

    try {
      globalStore.isInitDataLoading = true
      if (!data) {
        data = await ApiService.getConfig()
      }

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
}
