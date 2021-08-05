<template lang="pug">
v-card.note-preview.cursor-pointer.fill-height.pa-4.pt-3(
  :class="{ 'with-completed': completedListItems.length }"
  tabindex="0"
  :ripple="false"
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

      .co-authors-container.d-flex.justify-end.fill-width
        .co-authors.d-flex.justify-end
          v-avatar(
            v-for="(coAuthor, index) in note.coAuthors"
            :key="coAuthor.id"
            :class="{ 'ml-2': index > 0 }"
            size="20"
            color="purple"
          )
            .white--text.font-size-10 {{ coAuthor.user.getInitials() }}

    .completed-list-header.d-flex.align-center.grey--text.fill-width.mt-2.pl-5(
      v-if="completedListItems.length"
    )
      div +
      .green--text.font-weight-bold.ml-1 {{ completedListItems.length }}
      .ml-1 completed

  .text.d-flex.flex-column(
    v-else
  )
    div {{ note.text }}
    .co-authors-container.d-flex.justify-end.fill-width
      .co-authors.d-flex.justify-end
        v-avatar(
          v-for="(coAuthor, index) in note.coAuthors"
          :key="coAuthor.id"
          :class="{ 'ml-2': index > 0 }"
          size="20"
          color="purple"
        )
          .white--text.font-size-10 {{ coAuthor.user.getInitials() }}

  v-btn.remove-button(
    v-if="isMyNote"
    @click.stop="$emit('remove')"
    icon
  )
    v-icon mdi-close
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'
import NoteModel from '~/models/note'
import TypeModel from '~/models/type'
import UserModel from '~/models/user'

@Component
export default class NotePreviewComponent extends Vue {
  @Prop() note!: NoteModel

  @State user!: UserModel

  NOTE_TYPE_LIST = TypeModel.TYPE_LIST
  NOTE_TYPE_TEXT = TypeModel.TYPE_TEXT

  get isMyNote () {
    return this.user.id === this.note.userId
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
}
</script>

<style lang="stylus" scoped>
@import '~assets/css/variables'

.note-preview
  position relative
  overflow hidden
  background none
  transform scale(1)
  transition transform 0.3s

  &:focus
    outline none
    border-radius 6px
    box-shadow 0 0 15px rgba(0, 0, 0, 0.3)
    transform scale(1.05)

  &:before
    background none

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

  .co-authors-container
    position absolute
    bottom 16px

  .co-authors
    position relative
    overflow hidden
    z-index 30

    &:after
      content ''
      width 100%
      height 20px
      position absolute
      bottom 0
      left 0
      z-index 20
      background linear-gradient(to left, transparent, #fff 25px)

  .remove-button
    position absolute
    right 4px
    top 5px
    background radial-gradient(#fff 30%, transparent)

  .title
    line-height normal

  .text
    height calc(100% - 16px)
    position relative

  .list
    height calc(100% - 24px)
    position relative

    .list-item
      &.checked
        .list-item__text
          text-decoration line-through
          color $blue-grey-lighten-3

  .completed-list-header
    position absolute
    left 0
    bottom 16px
    z-index 30

  ::v-deep .mdi-checkbox-blank-outline, ::v-deep .mdi-checkbox-marked
    &:before
      font-size 16px

@media (max-width: 600px)
  .note-preview
    padding 8px 10px 10px 10px

@media (max-width: 700px)
  .co-authors
    display none !important
</style>
