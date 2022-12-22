import { AxiosError } from 'axios'
import { Emitter } from 'mitt'
import { Router } from 'vue-router'

export type TGlobalError = { statusCode: number | undefined, message: string }

export type TEvents = {
  showGlobalError: TGlobalError
  keydown: KeyboardEvent
}

export default class BaseService {
  static URL = 'https://api.notes.pavlo.ru/'

  static showError: (error: Error | TGlobalError) => void

  static eventBus: Emitter<TEvents>

  static router: Router

  static parseAxiosError(error: AxiosError): TGlobalError {
    return {
      statusCode: Number(error.code) || error?.response?.status || undefined,
      message: error?.response?.data.message || error.message,
    }
  }

  static pause(milliseconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds)
    })
  }
}
