import { AxiosError } from 'axios'
import { Emitter } from 'mitt'
import { Router } from 'vue-router'
import { TEvents, TGlobalError } from '~/types'
import ApiService from './api/api'

export default class BaseService {
  static URL = 'https://api.notes.pavlo.ru/'

  static OFFLINE_STORE_NAME = 'offline-data'

  static api: ApiService

  static showError: (error: Error | TGlobalError) => void

  static eventBus: Emitter<TEvents>

  static router: Router

  static parseAxiosError(error: AxiosError): TGlobalError {
    return {
      statusCode: Number(error.code) || error?.response?.status || undefined,
      message: (error?.response?.data as { message: string }).message || error.message,
    }
  }

  static pause(milliseconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds)
    })
  }
}
