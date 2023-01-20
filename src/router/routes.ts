import { RouteRecordRaw } from 'vue-router'
import MainLayoutComponent from '~/layouts/MainLayout.vue'
import IndexPageComponent from '~/pages/IndexPage.vue'
import NotePageComponent from '~/pages/NotePage.vue'
import SignPageComponent from '~/pages/SignPage.vue'
import ErrorNotFoundPageComponent from '~/pages/ErrorNotFoundPage.vue'

export const ROUTE_EXISTED_NOTE = 'existed-note'
export const ROUTE_NEW = 'new-note'
export const ROUTE_SIGN = 'sign'
export const ROUTE_NOTES = 'notes'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayoutComponent,
    children: [{
      path: '',
      name: ROUTE_NOTES,
      component: IndexPageComponent,
    }],
  },
  {
    path: '/sign',
    component: MainLayoutComponent,
    children: [{
      path: '',
      name: ROUTE_SIGN,
      component: SignPageComponent,
    }],
  },
  {
    path: '/note/:id',
    component: MainLayoutComponent,
    children: [{
      path: '',
      name: ROUTE_EXISTED_NOTE,
      component: NotePageComponent,
    }],
  },
  {
    path: '/new/:id',
    component: MainLayoutComponent,
    children: [{
      path: '',
      name: ROUTE_NEW,
      component: NotePageComponent,
    }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: ErrorNotFoundPageComponent,
  },
]

export default routes
