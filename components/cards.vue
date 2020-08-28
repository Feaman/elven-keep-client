<template lang="pug">
.cards.row
  card(
    v-for="card in filteredCards"
    :key="card.id"
    :card="card"
  )
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'
import { RootState } from '~/store'
import CardModel from '~/models/card'

const filterCards = function (state: RootState): Array<CardModel> {
  return state.cards.filter((card: CardModel) => {
    const regExp = new RegExp(state.searchQuery, 'i')
    return regExp.test(card.title) || regExp.test(card.text)
  })
}

@Component
export default class CardsComponent extends Vue {
  @State(state => filterCards(state)) filteredCards!: Array<CardModel>
}
</script>

<style lang="stylus" scoped>
.cards
  flex-wrap wrap
  padding 24px

  .card
    margin 16px
</style>
