import notesService from '~/composables/services/notes'
import statusesService from '~/composables/services/statuses'
import typesService from '~/composables/services/types'
import { useGlobalStore } from '~/stores/global'
import ApiService, { ConfigObject } from './api/api'

export default class InitService {
  static async initApplication(data: ConfigObject | undefined = undefined): Promise<void> {
    if (!data) {
      data = await ApiService.getConfig()
    }

    typesService.generateTypes(data.types)
    statusesService.generateStatuses(data.statuses)
    notesService.generateNotes(data.notes)

    const globalStore = useGlobalStore()
    globalStore.setUser(data.user)
    // SSEService.init()
  }
}
