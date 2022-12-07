import BaseService from './base'
import { ConfigObject } from './api/api'
import { useTypesStore } from '~/stores/types'
import { useStatusesStore } from '~/stores/statuses'
import { useGlobalStore } from '~/stores/global'
import { useNotesStore } from '~/stores/notes'

export default class InitService {
  static async initApplication(data: ConfigObject | undefined = undefined): Promise<void> {
    if (!data) {
      data = await BaseService.api.getConfig()
    }

    const typesStore = useTypesStore()
    typesStore.generateTypes(data.types)

    const statusesStore = useStatusesStore()
    statusesStore.generateStatuses(data.statuses)

    const notesStore = useNotesStore()
    notesStore.generateNotes(data.notes)

    const globalStore = useGlobalStore()
    globalStore.setUser(data.user)
    // SSEService.init()
  }
}
