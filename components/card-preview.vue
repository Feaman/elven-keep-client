<template lang="pug">
v-card.card-preview.cursor-pointer.pa-4
  .title {{ card.title }}
  .list(v-if="card.type === CARD_TYPE_LIST")
    .list-item.d-flex.align-center(
      v-for="(listItem, i) in card.list"
      :key="i"
    )
      v-icon mdi-checkbox-blank-outline
      .list-item__text.limit-width-100.ml-2 {{ listItem.text }}
  .text(
    v-else
  ) {{ card.text }}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import CardModel from '~/models/card'

@Component
export default class CardPreviewComponent extends Vue {
  @Prop(CardModel) card!: CardModel

  CARD_TYPE_LIST = CardModel.TYPE_LIST
  CARD_TYPE_TEXT = CardModel.TYPE_TEXT
}
</script>

<style lang="stylus" scoped>
@include '~/'
.card-preview
  min-width 112px
  max-width 250px
  width 250px
  height fit-content
</style>
