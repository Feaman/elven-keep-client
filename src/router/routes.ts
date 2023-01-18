import { RouteRecordRaw } from 'vue-router'
import MainLayoutComponent from '~/layouts/MainLayout.vue'
import IndexPageComponent from '~/pages/IndexPage.vue'
import NotePageComponent from '~/pages/NotePage.vue'
import SignPageComponent from '~/pages/SignPage.vue'
import ErrorNotFoundPageComponent from '~/pages/ErrorNotFoundPage.vue'

export const ROUTE_EXISTED_NOTE = 'existed-note'
export const ROUTE_SIGN = 'sign'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayoutComponent,
    children: [{
      path: '',
      name: 'notes',
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
      name: 'new-note',
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
