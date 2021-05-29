<template lang="pug">
.notes-toolbar
  v-toolbar(
    color="primary"
    dark
  )
    .d-flex.align-center
      search
      v-tooltip(
        bottom
      )
        template(
          v-slot:activator="{ on, attrs }"
        )
          v-btn.ml-2(
            @click="$router.push('/new/list')"
            v-bind="attrs"
            v-on="on"
            icon
          )
            v-icon mdi-format-list-bulleted-square
        span Create list note
      v-tooltip(
        bottom
      )
        template(
          v-slot:activator="{ on, attrs }"
        )
          v-btn(
            @click="$router.push('/new/text')"
            v-bind="attrs"
            v-on="on"
            icon
          )
            v-icon mdi-text-box-outline
        span Create text note
      v-divider.ml-1(vertical)
      v-menu(
        offset-y
      )
        template(
          v-slot:activator="{ on, attrs }"
        )
          v-btn(
            v-bind="attrs"
            v-on="on"
            icon
          )
            v-icon mdi-account-outline
        div
          .grey--text.mt-4.mb-2 {{ user.getFio() }}
          v-divider
          v-list
            v-list-item
              v-list-item-title(@click="logout()") Logout
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import UserModel from '~/models/user'
import UserService from '~/services/user'

@Component
export default class SearchComponent extends Vue {
  @State(state => state.user) user!: UserModel

  async logout () {
    await UserService.logout()
  }
}
</script>

<style lang="stylus" scoped>
.notes-toolbar
  position absolute
  z-index 100

::v-deep .v-toolbar__content
  padding: 4px 2px 4px 16px

::v-deep .dialog
  background-color #fff

  .v-toolbar
    z-index 20

@media (max-width: 600px)
  .app-bar
    .logo
      display none

    .search
      margin-left 0
</style>
