import { AxiosError } from 'axios'
import notesService from '~/composables/services/notes'
import statusesService from '~/composables/services/statuses'
import typesService from '~/composables/services/types'
import { ROUTE_SIGN } from '~/router/routes'
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

      typesService.generateTypes(data.types)
      statusesService.generateStatuses(data.statuses)
      notesService.generateNotes(data.notes)

      globalStore.setUser(data.user)
    } catch (error) {
      globalStore.initError = BaseService.parseAxiosError(error as AxiosError)
    } finally {
      globalStore.isInitDataLoading = false
    }
  }

  static async handleApplicationUpdate() {
    if (this.router.currentRoute.value.name === ROUTE_SIGN) {
      return
    }
    const globalStore = useGlobalStore()
    globalStore.isInitDataLoading = true
    const data = await ApiService.getConfig()
    notesService.updateNotes(data.notes)
    globalStore.isSocketErrorOnce = false
    globalStore.isInitDataLoading = false
  }
}
