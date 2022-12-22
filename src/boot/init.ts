import { AxiosError } from 'axios'
import mitt from 'mitt'
import { boot } from 'quasar/wrappers'
import draggable from 'vuedraggable'
import BaseService, { TGlobalError, type TEvents } from '~/services/base'
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
