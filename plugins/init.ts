import Vue from 'vue'
import BaseService from '~/services/base'
import ApiService from '~/services/api'
import HeaderComponent from '~/components/header'
import CardsComponent from '~/components/cards'
import CardComponent from '~/components/card'
import SearchComponent from '~/components/search'

export default (context) => {
  BaseService.error = context.error
  BaseService.api = ApiService
  BaseService.vuex = context.store
  BaseService.events = new Vue()

  // Fix 100vh for mobile
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)

  Vue.component('header-row', HeaderComponent)
  Vue.component('search', SearchComponent)
  Vue.component('card', CardComponent)
  Vue.component('cards', CardsComponent)
}
