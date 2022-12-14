import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('~/pages/IndexPage.vue') }],
  },
  {
    path: '/sign',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('~/pages/SignPage.vue') }],
  },
  {
    path: '/note/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      component: () => import('~/pages/NotePage.vue'),
    }],
    alias: ['/new/list', '/new/text'],
  },
  {
    path: '/error',
    component: () => import('layouts/ErrorLayout.vue'),
    children: [{ path: '', component: () => import('~/components/ErrorPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('~/pages/ErrorNotFoundPage.vue'),
  },
]

export default routes
