import { route } from 'quasar/wrappers'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'
import UsersService from '~/composables/services/users'
import routes, { ROUTE_SIGN } from '~/router/routes'
import BaseService from '~/services/base'
import StorageService from '~/services/storage'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route((/* { store, ssrContext } */) => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach((to, _from, next) => {
    const isTokenExists = StorageService.get(UsersService.AUTH_TOKEN_NAME)
    if (to.name !== ROUTE_SIGN && !isTokenExists) {
      next({ name: ROUTE_SIGN })
    } else {
      next()
    }
  })

  BaseService.router = Router

  return Router
})
