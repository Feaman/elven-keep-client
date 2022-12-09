import { AxiosError } from 'axios'
import mitt from 'mitt'
import { useMeta } from 'quasar'
import { boot } from 'quasar/wrappers'
import BaseService, { TGlobalError, type TEvents } from '~/services/base'
import InitService from '~/services/init'
import { useGlobalStore } from '~/stores/global'

export default boot(async ({ app }) => {
  const store = useGlobalStore()

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

  app.config.errorHandler = (error) => BaseService.showError(error as Error)

  useMeta(() => ({
    title: 'Удобные заметки',
    link: {
      roboto: {
        rel: 'stylesheet',
        // eslint-disable-next-line
        href: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap',
      },
    },
  }))

  try {
    await InitService.initApplication()
  } catch (error) {
    store.initError = BaseService.parseAxiosError(error as AxiosError)
  }
})
