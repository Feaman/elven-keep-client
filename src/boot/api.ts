import axios, { AxiosInstance } from 'axios'
import { boot } from 'quasar/wrappers'
import UsersService from '~/composables/services/users'
import ApiService from '~/services/api/api'
import AxiosApi from '~/services/api/axios-api'
import StorageService from '~/services/storage'

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

export default boot(() => {
  const axiosApi = new AxiosApi(axiosInstance)
  axiosApi.setRequestInterceptor((config) => {
    // Auth token
    const token = StorageService.get(UsersService.AUTH_TOKEN_NAME)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Set SSE salt
    // config.headers['x-sse-salt'] = this.vuex.state.SSESalt

    return config
  })
  // axiosApi.setResponseInterceptor((response) => new Promise((resolve) => {
  //   setTimeout(() => resolve(response), 3000)
  // }))
  ApiService.api = axiosApi
})
