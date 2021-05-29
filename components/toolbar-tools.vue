<template lang="pug">
  .toolbar-tools.d-flex
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
import UserModel from '~/models/user'
import UserService from '~/services/users'

@Component
export default class SearchComponent extends Vue {
  @State(state => state.user) user!: UserModel

  async logout () {
    await UserService.logout()
  }
}
</script>
