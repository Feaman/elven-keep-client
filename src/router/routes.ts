import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      name: 'notes',
      component: () => import('~/pages/IndexPage.vue'),
    }],
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
      name: 'existed-note',
      component: () => import('~/pages/NotePage.vue'),
    }],
  },
  {
    path: '/new/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      name: 'new-note',
      component: () => import('~/pages/NotePage.vue'),
    }],
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
