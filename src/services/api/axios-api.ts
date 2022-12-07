import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import IApi from '~/services/api/interface'

export default class AxiosApi implements IApi {
  api: AxiosInstance

  constructor(api: AxiosInstance) {
    this.api = api
  }

  setRequestInterceptor(requestHandler: (config: { headers?: { [index: string]: string } }) => void): void {
    this.api.interceptors.request.use((config: AxiosRequestConfig) => requestHandler(config))
  }

  setResponseInterceptor(responseHandler: (response: { data: object, status: number }) => void): void {
    this.api.interceptors.response.use((response: AxiosResponse) => responseHandler(response))
  }

  get(url: string, config: object) {
    return this.api.get(url, config)
  }

  post(url: string, data?: object, config?: object) {
    return this.api.post(url, data, config)
  }

  put(url: string, data?: object, config?: object) {
    return this.api.put(url, data, config)
  }

  delete(url: string, data: object) {
    return this.api.delete(url, data)
  }
}
