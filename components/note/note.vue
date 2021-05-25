<template lang="pug">
  .note.d-flex.flex-column.align-center.fill-height
    v-toolbar.toolbar.fill-width(
      color="primary"
      dark
    )
      v-btn(
        @click="$router.back()"
        icon
        dark
      )
        v-icon mdi-arrow-left
      v-spacer
      saving(v-if="note.id")

    .content.d-flex.flex-column.fill-width.fill-height.pt-2.px-3
      v-text-field.title-field.mt-1.mb-2(
        @input="note.update({ title: $event })"
        :value="note.title"
        placeholder="Title"
        hide-details
        dense
      )
      v-textarea.text(
        v-if="note.type.name === NOTE_TYPE_TEXT"
        @input="note.update({ text: $event })"
        :value="note.text"
        height="100%"
        placeholder="Text"
        hide-details
        outlined
        auto-grow
      )
      template(v-if="note.type.name === NOTE_TYPE_LIST")
        note-list(
          :note="note"
          :list="mainListItems"
          :is-main="true"
        )
        template(v-if="completedListItems.length")
          v-divider(
            :class="{ 'my-2': isNewButtonShown, 'my-2 mt-6': !isNewButtonShown }"
            v-if="completedListItems.length"
          )
          v-expansion-panels.mt-2.mb-4(
            v-model="expandedListItems"
            multiple
          )
            v-expansion-panel
              v-expansion-panel-header
                template(v-slot:actions)
                  v-icon.icon $expand
                .completed-list-header.green--text.d-flex.align-center.ml-4
                  .font-weight-bold.font-size-16 {{ completedListItems.length }}
                  .ml-2 completed
              v-expansion-panel-content
                note-list(
                  :note="note"
                  :list="completedListItems"
                )
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import NoteModel from '~/models/note'
import TypeModel from '~/models/type'

@Component
export default class NoteComponent extends Vue {
  @Prop(NoteModel) note!: NoteModel

  NOTE_TYPE_LIST = TypeModel.TYPE_LIST
  NOTE_TYPE_TEXT = TypeModel.TYPE_TEXT

  get isNewButtonShown () {
    return !this.mainListItems.find(item => !item.text)
  }

  get expandedListItems () {
    return this.note.isCompletedListExpanded ? [0] : []
  }

  set expandedListItems (expandedPanelsArray: number[]) {
    this.note.update({ isCompletedListExpanded: !!expandedPanelsArray.length })
  }

  get completedListItems () {
    return this.note.list.filter(listItem => listItem.completed)
  }

  get mainListItems () {
    return this.note.list
      .filter(listItem => !listItem.completed)
      .sort((previousItem, nextItem) => {
        if (previousItem.checked === nextItem.checked) {
          return 0
        }
        return previousItem.checked ? 1 : -1
      })
  }

  mounted () {
    const app = this
    document.onkeydown = function (event) {
      event = event || window.event
      if (event.key === "Escape" || event.key === "Esc") {
        app.$router.go(-1)
      }
    }
  }

  destroyed () {
    document.onkeydown = null
  }
}
</script>

<style lang="stylus" scoped>
@import '~assets/css/variables'

$active-row-color = #6A1B9A

.note
  .toolbar
    z-index 30

  .content
    max-width 900px
    height calc(100% - 56px)
    overflow auto

    .v-expansion-panel-header
      min-height 32px

    .completed-list-header
      order 1

    .title-field
      max-height 32px

    .text
      ::v-deep
        .v-input__control, .v-input__slot
          height 100%

    .v-input
      ::v-deep input
        font-weight bold
        font-size 24px

      ::v-deep textarea
        height 100% !important
        overflow auto
        margin-top 0

      ::v-deep fieldset
        border none

      ::v-deep .v-input__slot
        padding 0 !important

        &:before
          border none

    .v-expansion-panel
      &:before
        box-shadow none

      ::v-deep .v-expansion-panel-content__wrap, .v-expansion-panel-header
        padding 0
</style>
