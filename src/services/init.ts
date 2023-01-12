import { AxiosError } from 'axios'
import notesService from '~/composables/services/notes'
import statusesService from '~/composables/services/statuses'
import typesService from '~/composables/services/types'
import BaseService from '~/services//base'
import ApiService, { ConfigObject } from '~/services/api/api'
import { useGlobalStore } from '~/stores/global'
import SocketIOService from './socket-io'

export default class InitService {
  static async initApplication(data: ConfigObject | undefined = undefined): Promise<void> {
    const globalStore = useGlobalStore()
    try {
      globalStore.isInitDataLoading = true
      if (!data) {
        data = await ApiService.getConfig()
      }

      typesService.generateTypes(data.types)
      statusesService.generateStatuses(data.statuses)
      notesService.generateNotes(data.notes)

      globalStore.setUser(data.user)
      SocketIOService.init()
    } catch (error) {
      globalStore.initError = BaseService.parseAxiosError(error as AxiosError)
    } finally {
      globalStore.isInitDataLoading = false
    }
  }
}
