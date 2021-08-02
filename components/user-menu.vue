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
        .px-4.pt-2
          .grey--text.text--darken-2 {{ user.getFio() }}
          .grey--text.mb-2 {{ user.email }}
        v-divider
        v-list
          v-list-item
            v-list-item-title.cursor-pointer(@click="logout()") Logout
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
