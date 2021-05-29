import { Context } from '@nuxt/types'
import StorageService from '~/services/storage'
import UserService from '~/services/user'

export default function (context: Context) {
  // If the user is not authenticated
  const token = StorageService.get(UserService.AUTH_TOKEN_NAME)
  if (!['login'].includes(String(context.route.name)) && !token) {
    return context.redirect('/login')
  }
}
