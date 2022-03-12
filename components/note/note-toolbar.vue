<template lang="pug">
  v-toolbar.note-toolbar.d-flex.justify-center.fill-width(
    color="primary"
  )
    v-btn(
      @click="$router.push('/')"
      icon
    )
      v-icon mdi-home
    v-divider(vertical)
    v-tooltip(
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
    v-btn(
        v-if="note.isList()"
      @click="$eventBus.$emit('fullscreen', note)"
      icon
    )
      v-icon mdi-fullscreen
    saving(v-if="note.id")
    v-divider.ml-4(vertical)
    user-menu
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
  max-height 64px
  z-index 30

  ::v-deep .v-toolbar__content
    max-width 900px
    width 100%
    padding-left 12px
    padding-right 0px

@media (max-width: 960px)
  .note-toolbar
    max-height 56px
</style>
