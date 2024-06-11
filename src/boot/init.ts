import { AxiosError } from 'axios'
import { boot } from 'quasar/wrappers'
import draggable from 'zhyswan-vuedraggable'
import ApiService from '~/services/api/api'
import BaseService from '~/services/base'
import InitService from '~/services/init'
import SocketIOService from '~/services/socket-io'
import SyncService from '~/services/sync'
import { useGlobalStore } from '~/stores/global'
import { TGlobalError } from '~/types'

export default boot(({ app }) => {
  BaseService.api = new ApiService()
  BaseService.showError = (error: Error | TGlobalError) => {
    let resultError: TGlobalError | Error = error
    if ((error as AxiosError).response) {
      resultError = BaseService.parseAxiosError(error as AxiosError)
    } else if (error instanceof Error) {
      resultError = { statusCode: 500, message: error.message }
    }
    BaseService.eventBus.emit('showGlobalError', resultError as TGlobalError)
  }

  // Keydown events
  document.onkeydown = (event: KeyboardEvent) => {
    BaseService.eventBus.emit('keydown', event)
  }

  (new Image()).src = '/images/crying-girl.jpg'

  // Register all the components
  const componentsFolderFiles: { [index: string]: { default: object } } = import.meta.globEager('../components/**/*.vue')
  Object.keys(componentsFolderFiles).forEach((key: string) => {
    const part: string | undefined = key.split('/').pop()
    if (part) {
      app.component(part.split('.')[0], componentsFolderFiles[key].default)
    }
  })

  app.config.errorHandler = (error) => {
    BaseService.showError(error as Error)
    // eslint-disable-next-line no-console
    console.error(error)
  }

  app.component('Draggable', draggable)

  // Handle app focus
  let isDocumentFocused: boolean | null = null
  setInterval(() => {
    if (document.hasFocus()) {
      if (isDocumentFocused !== true) {
        BaseService.eventBus.emit('windowFocused', true)
      }
      isDocumentFocused = true
    } else {
      isDocumentFocused = false
    }
  }, 200)

  BaseService.eventBus.on('windowFocused', async () => {
    try {
      const currentDateTime = new Date()
      if (currentDateTime.getTime() - BaseService.lastFocused.getTime() > 300000) {
        window.location.reload()
      } else {
        await SyncService.handleApplicationUpdate()
      }
    } catch (error) {
      BaseService.showError(error as Error)
    }
  })

  const store = useGlobalStore()
  window.addEventListener('offline', () => {
    store.isOnline = false
  })
  window.addEventListener('online', () => {
    store.isOnline = true
    SyncService.synchronizeOfflineData()
  })

  const channel = new BroadcastChannel('elven-keep-service-worker')
  channel.addEventListener('message', (event) => {
    if (event.data.updateReady === true) {
      store.isNewVersionAvailable = true
    }
  })

  SocketIOService.init()
  InitService.initApplication()
})
