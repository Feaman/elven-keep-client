<template lang="pug">
  v-toolbar.note-toolbar.fill-width(
    color="primary"
    dark
  )
    v-btn(
      @click="$router.back()"
      icon
      dark
    )
      v-icon mdi-arrow-left
    v-divider(vertical)
    v-tooltip(
      v-if="isMyNote"
      bottom
    )
      template(
        v-slot:activator="{ on, attrs }"
      )
        v-btn(
          @click="$emit('co-authors-clicked')"
          v-bind="attrs"
          v-on="on"
          icon
        )
          v-icon mdi-account-group
      span Manage authors
    v-divider(vertical)
    toolbar-tools
    v-divider(vertical)
    v-spacer
    div
      user-menu
    v-divider.ml-1.mr-4(vertical)
    saving(v-if="note.id")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'
import NoteModel from '~/models/note'
import UserModel from '~/models/user'

@Component
export default class NoteToolbar extends Vue {
  @Prop(NoteModel) note!: NoteModel
  @State user!: UserModel

  get isMyNote () {
    return this.user.id === this.note.userId
  }
}
</script>
<style lang="stylus" scoped>
.note-toolbar
  z-index 30
</style>
