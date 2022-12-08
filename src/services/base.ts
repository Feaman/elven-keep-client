import { AxiosError } from 'axios'
import { Emitter } from 'mitt'
import ApiService from '~/services/api/api'

export type TGlobalError = { statusCode: number | undefined, message: string }

export type TEvents = {
  showGlobalError: TGlobalError
}

export default class BaseService {
  static api: ApiService

  static showError: (error: Error | TGlobalError) => void

  static eventBus: Emitter<TEvents>

  // static showAxiosError(error: AxiosError) {
  // BaseService.showError({ statusCode: Number(error.code) || undefined, message: error.message })
  // }

  static parseAxiosError(error: AxiosError): TGlobalError {
    return { statusCode: Number(error.code) || undefined, message: error.message }
  }
}
