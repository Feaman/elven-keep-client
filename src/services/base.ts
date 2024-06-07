import { AxiosError } from 'axios'
import { Emitter } from 'mitt'
import { Router } from 'vue-router'
import { TNote } from '~/composables/models/note'
import StatusesService from '~/composables/services/statuses'
import { TEvents, TGlobalError } from '~/types'
import ApiService from './api/api'
import StorageService from './storage'

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
      message: error.message || (error?.response?.data as { message: string }).message,
    }
  }

  static pause(milliseconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds)
    })
  }
}
