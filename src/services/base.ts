import { Emitter } from 'mitt'
import ApiService from '~/services/api/api'

export type TGlobalError = { statusCode: number | undefined, message: string }

export type TEvents = {
  showGlobalError: TGlobalError;
};

export default class BaseService {
  static api: ApiService

  static showError: (error: TGlobalError) => void

  static eventBus: Emitter<TEvents>
}
