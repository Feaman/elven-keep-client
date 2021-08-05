import Vue from 'vue'
import { Store } from 'vuex'
import VueRouter, { Route } from 'vue-router/types'
import ApiService, { ConfigObject } from '~/services/api'
import UserModel from '~/models/user'

export default class BaseService {
  static api: typeof ApiService
  static vuex: Store<any>
  static error: Function
  static router: VueRouter | undefined
  static route: Route
  static events: Vue

  static async initApplication (): Promise<any> {
    const data = await this.api.getConfig()
    return this.handleInitData(data)
  }

  static handleInitData (data: ConfigObject) {
    return new Promise(resolve => {
      const TypesService = require('~/services/types').default
      const StatusesService = require('~/services/statuses').default
      const NotesService = require('~/services/notes').default
      const SSEService = require('~/services/sse').default

      TypesService.generateTypes(data.types)
      StatusesService.generateStatuses(data.statuses)
      NotesService.generateNotes(data.notes)

      this.vuex.commit('setUser', new UserModel(data.user))
      SSEService.init()
      resolve('')
    })
  }
}
