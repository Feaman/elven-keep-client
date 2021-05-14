<template lang="pug">
.card.d-flex.flex-column.fill-width.pa-4
  v-text-field(
    @input="card.update({ title: $event })"
    :value="card.title"
    placeholder="Set note title"
    hide-details
  )
  v-textarea.text(
    v-if="card.type === CARD_TYPE_TEXT"
    @input="card.update({ text: $event })"
    :value="card.text"
    outlined
    auto-grow
  )
  template(v-if="card.type === CARD_TYPE_LIST")
    template(v-if="mainListItems.length")
      card-list.mt-4(
        :card="card"
        :list="mainListItems"
        :is-main="true"
      )
    template(v-if="completedListItems.length")
      v-divider.my-2(v-if="mainListItems.length")
      v-expansion-panels.mt-4(
        v-model="expandedListItems"
        multiple
      )
        v-expansion-panel
          v-expansion-panel-header
            template(v-slot:actions)
              v-icon.icon $expand
            .completed-list-header.d-flex.align-center.ml-4
              .green--text {{ completedListItems.length }}
              .ml-2 Completed
          v-expansion-panel-content
            card-list(
              :card="card"
              :list="completedListItems"
            )
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import CardModel from '~/models/card'

@Component
export default class CardComponent extends Vue {
  @Prop(CardModel) card!: CardModel

  CARD_TYPE_LIST = CardModel.TYPE_LIST
  CARD_TYPE_TEXT = CardModel.TYPE_TEXT

  get expandedListItems () {
    return this.card.isCompletedListExpanded ? [0] : []
  }

  set expandedListItems (expandedPanelsArray: number[]) {
    this.card.update({ isCompletedListExpanded: !!expandedPanelsArray.length })
  }

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

$active-row-color = #6A1B9A

.card
  max-width 900px

  .v-expansion-panel-header
    min-height 32px

  .completed-list-header
    order 1

  .v-expansion-panel
    &:before
      box-shadow none

    ::v-deep .v-expansion-panel-content__wrap, .v-expansion-panel-header
      padding 0
</style>
