import Vue from 'vue'
import { Context } from '@nuxt/types'
import draggable from 'vuedraggable'
import BaseService from '~/services/base'
import ApiService from '~/services/api'

export default (context: Context) => {
  BaseService.error = context.error
  BaseService.api = ApiService
  BaseService.vuex = context.store
  BaseService.events = new Vue()

  // Fix 100vh for mobile
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)

  // Register all the components
  const componentsFolderFiles: any = require.context('../components', true, /\.vue$/i)
  componentsFolderFiles.keys().forEach((key: String) => {
    const part: String | undefined = key.split('/').pop()
    if (part) {
      Vue.component(part.split('.')[0], componentsFolderFiles(key).default)
    }
  })

  // Draggable
  Vue.component('Draggable', draggable)
}
