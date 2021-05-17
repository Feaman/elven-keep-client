<template lang="pug">
.cards.pr-4.pb-4
    transition-group.d-flex.flex-wrap(
      name="horizontal-list-effect"
      tag="div"
    )
      .card.ml-4.mt-4.pa-1(
        v-for="card in filteredCards"
        :key="card.id"
      )
        card-preview(
          @click.native="$store.dispatch('setCurrentCard', card)"
          :card="card"
        )
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import CardModel from '@/models/card'

@Component
export default class CardsComponent extends Vue {
  @State(state => state.cards) cards!: Array<CardModel>
  @State(state => state.searchQuery) searchQuery!: string

  get filteredCards () {
    if (!this.searchQuery) {
      return this.cards
    }
    return this.cards.filter((card: CardModel) => {
      const regExp = new RegExp(this.searchQuery, 'i')
      let foundInLisListItems = false
      card.list.forEach(listItem => {
        if (regExp.test(listItem.text || '')) {
          foundInLisListItems = true
        }
      })
      return regExp.test(card.title || '') || regExp.test(card.text || '') || foundInLisListItems
    })
  }
}
</script>

<style lang="stylus" scoped>
.cards
  .card
    min-width 250px
    max-width 350px
    height 250px
    flex 1
    overflow hidden

@media (max-width: 600px)
  .cards
    .card
      min-width 148px
</style>
