import Vue from 'vue'
import { Store } from 'vuex'
import { NuxtAxiosInstance } from '@nuxtjs/axios'
import VueRouter from 'vue-router/types'
import ApiService from '~/services/api'

export default class BaseService {
  static api: typeof ApiService
  static vuex: Store<any>
  static axios: NuxtAxiosInstance
  static error: Function
  static router: VueRouter
  static events: Vue
}
