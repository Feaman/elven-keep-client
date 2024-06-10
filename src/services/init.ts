import { AxiosError } from 'axios'
import NotesService from '~/composables/services/notes'
import StatusesService from '~/composables/services/statuses'
import TypesService from '~/composables/services/types'
import UsersService from '~/composables/services/users'
import BaseService from '~/services//base'
import StorageService from '~/services/storage'
import { useGlobalStore } from '~/stores/global'
import { ConfigObject } from './api/interface'
import SyncService from './sync'

export default class InitService extends BaseService {
  static async initApplication(data?: ConfigObject): Promise<void> {
    const globalStore = useGlobalStore()

    try {
      globalStore.isInitDataLoading = true

      if (!data) {
        data = await BaseService.api.getConfig()
      }

      if (!globalStore.isOnline && !data) {
        globalStore.isNoOfflineDataError = true
        return
      }

      TypesService.generateTypes(data.types)
      StatusesService.generateStatuses(data.statuses)

      if (globalStore.isOnline) {
        const offlineData = StorageService.get(BaseService.OFFLINE_STORE_NAME)
        if (!offlineData) {
          StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: data })
        } else {
          SyncService.synchronizeOfflineData(data)
        }
      }

      NotesService.generateNotes(data.notes)

      globalStore.setUser(data.user)
      SyncService.clearRemovedOfflineNotesAndListItems()
    } catch (error) {
      globalStore.initError = BaseService.parseAxiosError(error as AxiosError)
    } finally {
      globalStore.isInitDataLoading = false
    }
  }

  static clearApplication() {
    StorageService.set({ [UsersService.AUTH_TOKEN_NAME]: undefined })
    StorageService.set({ [BaseService.OFFLINE_STORE_NAME]: undefined })
    const globalStore = useGlobalStore()
    NotesService.notes.value = []
    globalStore.user = null
  }
}
