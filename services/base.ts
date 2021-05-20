import Vue from 'vue'
import { Store } from 'vuex'
import VueRouter from 'vue-router/types'
import ApiService from '~/services/api'

export default class BaseService {
  static api: typeof ApiService
  static vuex: Store<any>
  static error: Function
  static router: VueRouter
  static events: Vue

  static initData () {
    const TypeService = require('~/services/type').default
    const StatusService = require('~/services/status').default
    const NoteService = require('~/services/note').default

    return Promise.all([TypeService.getTypes(), StatusService.getStatuses()])
      .then(() => NoteService.getNotes())
  }
}
