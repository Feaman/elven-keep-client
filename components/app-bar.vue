<template lang="pug">
.app-bar
  v-app-bar(
    color="primary"
    app
    dark
  )
    .d-flex.align-center
      v-toolbar-title.logo NOTES
      search
      v-tooltip(
        bottom
      )
        template(
          v-slot:activator="{ on, attrs }"
        )
          v-btn.ml-4(
            @click="createListNote()"
            v-bind="attrs"
            v-on="on"
            icon
          )
            v-icon mdi-format-list-bulleted-square
        span Create list notw
      v-tooltip(
        bottom
      )
        template(
          v-slot:activator="{ on, attrs }"
        )
          v-btn.ml-2(
            @click="createTextNote()"
            v-bind="attrs"
            v-on="on"
            icon
          )
            v-icon mdi-text-box-outline
        span Create text note
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import NoteModel from '~/models/note'
import ListItemModel from '~/models/list-item'
import TypeModel from '~/models/type'
import TypeService from '~/services/type'

@Component
export default class AppBarComponent extends Vue {
  @State(state => state.currentNote) currentNote!: NoteModel

  createTextNote () {
    this.$store.dispatch('setCurrentNote', new NoteModel({ typeId: TypeService.findByName(TypeModel.TYPE_TEXT).id }))
  }

  createListNote () {
    const note = new NoteModel({})
    this.$store.dispatch('setCurrentNote', note)
    this.currentNote.addListItem(new ListItemModel({ note }))
  }
}
</script>

<style lang="stylus" scoped>
.app-bar
  z-index 100

  .logo
    display flex

  .search
    margin-left 16px

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
