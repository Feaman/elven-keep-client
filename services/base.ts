import Vue from 'vue'
import { Store } from 'vuex'
import ApiService from '~/services/api'

export default class Base {
  static api: typeof ApiService
  static vuex: Store<any>
  static events: Vue

  static initData () {
    const CardService = require('~/services/card').default

    return Promise.all([
      CardService.getCards()
    ])
  }
}
