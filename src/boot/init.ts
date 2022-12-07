import { boot } from 'quasar/wrappers'
import mitt from 'mitt'
import { AxiosError } from 'axios'
import BaseService, { TEvents } from '~/services/base'
import InitService from '~/services/init'
import { useGlobalStore } from '~/stores/global'

export default boot(async ({ app }) => {
  const store = useGlobalStore()

  BaseService.eventBus = mitt<TEvents>()
  BaseService.showError = (error) => {
    BaseService.eventBus.emit('showGlobalError', error)
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
    BaseService.showError({ statusCode: 500, message: (error as Error).message })
  }

  try {
    await InitService.initApplication()
  } catch (error) {
    store.initError = { statusCode: Number((error as AxiosError)?.code) || undefined, message: (error as AxiosError).message }
  }
})
