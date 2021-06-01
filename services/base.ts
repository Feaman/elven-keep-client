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
    const TypesService = require('~/services/types').default
    const StatusesService = require('~/services/statuses').default
    const NotesService = require('~/services/notes').default

    TypesService.generateTypes(data.types)
    StatusesService.generateStatuses(data.statuses)
    NotesService.generateNotes(data.notes)

    return this.vuex.dispatch('setUser', new UserModel(data.user))
  }
}
