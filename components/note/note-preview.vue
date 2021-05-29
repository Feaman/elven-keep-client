<template lang="pug">
v-card.note-preview.cursor-pointer.fill-height.pa-4.pt-3(
  :class="{ 'with-completed': completedListItems.length }"
)
  .title.limit-width(v-if="note.title") {{ note.title }}
  template(v-if="note.type.name === NOTE_TYPE_LIST")
    .list(
      :class="{ 'mt-2': note.title }"
    )
      .list-item.d-flex.align-center.mt-1(
        v-for="(listItem, i) in mainListItems"
        :key="i"
        :class="{ checked: listItem.checked }"
      )
        v-icon(color="grey lighten-1") mdi-checkbox-blank-outline
        .list-item__text.limit-width.ml-2 {{ listItem.text }}
    .completed-list-header.d-flex.align-center.grey--text.mt-2.ml-1(
      v-if="completedListItems.length"
    )
      div +
      .green--text.font-weight-bold.ml-1 {{ completedListItems.length }}
      .ml-1 completed
  .text(
    v-else
  ) {{ note.text }}

  v-btn.remove-button(
    @click.stop="$emit('remove')"
    icon
  )
    v-icon mdi-close
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import NoteModel from '~/models/note'
import TypeModel from '~/models/type'

@Component
export default class NotePreviewComponent extends Vue {
  @Prop(NoteModel) note!: NoteModel

  NOTE_TYPE_LIST = TypeModel.TYPE_LIST
  NOTE_TYPE_TEXT = TypeModel.TYPE_TEXT

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
}
</script>

<style lang="stylus" scoped>
@import '~assets/css/variables'

.note-preview
  position relative
  overflow hidden

  &:after
    content ''
    width 100%
    height 90px
    position absolute
    bottom 0
    left 0
    z-index 20
    background linear-gradient(transparent, #fff 65px)

  &.with-completed:after
    height 170px
    background linear-gradient(transparent, #fff 120px)

  .remove-button
    position absolute
    right 4px
    top 5px
    background radial-gradient(#fff 30%, transparent)

  .title
    line-height normal

  .list
    .list-item
      &.checked
        .list-item__text
          text-decoration line-through
          color $blue-grey-lighten-3

  .completed-list-header
    position absolute
    bottom 16px
    z-index 30

  ::v-deep .mdi-checkbox-blank-outline, ::v-deep .mdi-checkbox-marked
    &:before
      font-size 16px

@media (max-width: 600px)
  .note-preview
    padding 8px 10px 10px 10px
</style>
