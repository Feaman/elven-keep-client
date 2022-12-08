import axios, { AxiosInstance } from 'axios'
import { boot } from 'quasar/wrappers'
import usersService from '~/composables/services/users'
import ApiService from '~/services/api/api'
import AxiosApi from '~/services/api/axios-api'
import BaseService from '~/services/base'
import StorageService from '~/services/storage'
import { useGlobalStore } from '~/stores/global'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const axiosInstance = axios.create({ baseURL: 'https://api.notes.pavlo.ru/' })

export default boot(({ app }) => {
  const globalStore = useGlobalStore()
  const axiosApi = new AxiosApi(axiosInstance)
  axiosApi.setRequestInterceptor((config) => {
    // Auth token
    const token = StorageService.get(usersService.AUTH_TOKEN_NAME)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Set SSE salt
    // config.headers['x-sse-salt'] = this.vuex.state.SSESalt

    globalStore.isLoading = true
    return config
  })
  axiosApi.setResponseInterceptor((response) => {
    globalStore.isLoading = false
    return response
  })
  BaseService.api = new ApiService(axiosApi)
  // api.onError((error: AxiosError) => {
  //   if (error.response) {
  //     if (error.response.status === 401) {
  //       if (this.route.name !== 'login') {
  //         // this.redirect('/login')
  //       }
  //     } else if (error.response.status !== 400) {
  //       // this.error({ statusCode: error.response.status, message: error.response.data.message })
  //     }
  //   } else {
  //     // this.error({ statusCode: 500, message: 'Something goes wrong' })
  //   }
  // })
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = BaseService.api
})
