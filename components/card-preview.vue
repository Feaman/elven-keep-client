<template lang="pug">
v-card.card-preview.cursor-pointer.fill-height.pa-4
  .title.limit-width(v-if="card.title") {{ card.title }}
  template(v-if="card.type.name === CARD_TYPE_LIST")
    .list(
      :class="{ 'mt-2': card.title }"
    )
      .list-item.d-flex.align-center.mt-1(
        v-for="(listItem, i) in mainListItems"
        :key="i"
        :class="{ checked: listItem.checked }"
      )
        v-icon(color="grey lighten-1") mdi-checkbox-blank-outline
        .list-item__text.limit-width.ml-2 {{ listItem.text }}
    .completed-list-header.d-flex.align-center.grey--text.mt-2.ml-2(
      v-if="completedListItems.length"
    )
      div +
      .font-weight-bold.ml-1 {{ completedListItems.length }}
      .ml-1 completed
  .text(
    v-else
  ) {{ card.text }}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import CardModel from '~/models/card'
import TypeModel from '~/models/type'

@Component
export default class CardPreviewComponent extends Vue {
  @Prop(CardModel) card!: CardModel

  CARD_TYPE_LIST = TypeModel.TYPE_LIST
  CARD_TYPE_TEXT = TypeModel.TYPE_TEXT

  get completedListItems () {
    return this.card.list.filter(listItem => listItem.completed)
  }

  get mainListItems () {
    return this.card.list
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

.card-preview
  position relative
  overflow hidden

  &:after
    content ''
    width 100%
    height 50px
    position absolute
    bottom 0
    left 0
    z-index 20
    background linear-gradient(transparent, #fff, #fff 60px);

  .title
    line-height normal

  .list
    .list-item
      &.checked
        .list-item__text
          text-decoration line-through
          color $blue-grey-lighten-3

  ::v-deep .mdi-checkbox-blank-outline, ::v-deep .mdi-checkbox-marked
    &:before
      font-size 16px
</style>
