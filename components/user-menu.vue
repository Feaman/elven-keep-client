<template lang="pug">
  .user-menu
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
      .white
        .grey.lighten-2.px-4.pt-2.pb-2
          .font-weight-bold {{ user.getFio() }}
          .font-size-14.grey--text.text--darken-1 {{ user.email }}
        v-list
          v-list-item
            v-list-item-title.cursor-pointer.py-1(@click="logout()") Logout
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import UserService from '~/services/users'
import UserModel from '~/models/user'

@Component
export default class SearchComponent extends Vue {
  @State user!: UserModel

  async logout () {
    await UserService.logout()
  }
}
</script>
