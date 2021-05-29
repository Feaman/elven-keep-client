import Vue from 'vue'
import { Store } from 'vuex'
import VueRouter from 'vue-router/types'
import ApiService, { ConfigObject } from '~/services/api'
import UserModel from '~/models/user'

export default class BaseService {
  static api: typeof ApiService
  static vuex: Store<any>
  static error: Function
  static router: VueRouter | undefined
  static events: Vue

  static initData (): Promise<any> {
    return this.api.getConfig()
      .then((data: ConfigObject) => {
        return this.handleInitData(data)
      })
  }

  static handleInitData (data: ConfigObject) {
    const TypeService = require('~/services/type').default
    const StatusService = require('~/services/status').default
    const NoteService = require('~/services/note').default

    TypeService.generateTypes(data.types)
    StatusService.generateStatuses(data.statuses)
    NoteService.generateNotes(data.notes)
    return this.vuex.dispatch('setUser', new UserModel(data.user))
  }
}
