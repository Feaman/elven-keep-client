<template lang="pug">
.fullscreen
  v-dialog(
    v-model="show"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  )
    .d-flex.flex-column.fill-height.white.pt-1.px-4
      note-list(
        :note="note"
        :list="mainListItems"
        :is-main="true"
        :fullscreen="true"
      )
      v-spacer
      .d-flex.flex-center.mb-4
        v-btn.mx-2(
          @click="$emit('close')"
          color="green lighten-1"
          fab
        )
          v-icon(color="white") mdi-check
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import NoteModel from '~/models/note'
import ListItemsService from '~/services/list-items'

@Component
export default class FullscreenComponent extends Vue {
  @Prop(NoteModel) note!: NoteModel
  @Prop(Boolean) show!: false

  get mainListItems () {
    return ListItemsService.filterAndSort(this.note.list)
  }
}
</script>

<style lang="stylus" scoped>
.fullscreen
  height 100vh
</style>
