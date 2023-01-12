import { AxiosError } from 'axios'
import mitt from 'mitt'
import { boot } from 'quasar/wrappers'
import draggable from 'zhyswan-vuedraggable'
import BaseService from '~/services/base'
import { TEvents, TGlobalError } from '~/types'
import InitService from '~/services/init'

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
  }

  app.component('Draggable', draggable)

  InitService.initApplication()
})
