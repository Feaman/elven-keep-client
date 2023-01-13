import { AxiosError } from 'axios'
import { QVueGlobals } from 'quasar'
import notesService from '~/composables/services/notes'
import statusesService from '~/composables/services/statuses'
import typesService from '~/composables/services/types'
import BaseService from '~/services//base'
import ApiService, { ConfigObject } from '~/services/api/api'
import { useGlobalStore } from '~/stores/global'

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
    } catch (error) {
      globalStore.initError = BaseService.parseAxiosError(error as AxiosError)
    } finally {
      globalStore.isInitDataLoading = false
    }
  }

  static async handleApplicationUpdate($q: QVueGlobals) {
    const globalStore = useGlobalStore()
    if (globalStore.isSocketErrorOnce) {
      $q.loading.show({
        spinner: { template: '<div></div>' },
        customClass: 'q-loading',
      })
      const data = await ApiService.getConfig()
      notesService.updateNotes(data.notes)
      globalStore.isSocketErrorOnce = false
      $q.loading.hide()
    }
  }
}
