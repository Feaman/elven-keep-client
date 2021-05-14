<template lang="pug">
.cards.d-flex.pa-4
  .d-flex.flex-wrap
    card-preview.ma-4(
      v-for="card in filteredCards"
      @click.native="$store.dispatch('setCurrentCard', card)"
      :key="card.id"
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
      return regExp.test(card.title || '') || regExp.test(card.text || '')
    })
  }
}
</script>
