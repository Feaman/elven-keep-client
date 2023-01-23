import { AxiosError } from 'axios'
import mitt from 'mitt'
import { boot } from 'quasar/wrappers'
import draggable from 'zhyswan-vuedraggable'
import BaseService from '~/services/base'
import { TEvents, TGlobalError } from '~/types'
import InitService from '~/services/init'
import SocketIOService from '~/services/socket-io'

export default boot(({ app }) => {
  BaseService.eventBus = mitt<TEvents>()
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
      await InitService.handleApplicationUpdate()
    } catch (error) {
      BaseService.showError(error as Error)
    }
  })

  SocketIOService.init()
  InitService.initApplication()
})
