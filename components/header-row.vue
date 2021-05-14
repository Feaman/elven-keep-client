<template lang="pug">
.header-row
  v-toolbar(
    color="primary"
    dark
  )
    .d-flex.align-center
      v-toolbar-title NOTES
      search.ml-4
      v-tooltip(
        bottom
      )
        template(
          v-slot:activator="{ on, attrs }"
        )
          v-btn.ml-4(
            @click="createListCard()"
            v-bind="attrs"
            v-on="on"
            icon
          )
            v-icon mdi-format-list-bulleted-square
        span Create list card
      v-tooltip(
        bottom
      )
        template(
          v-slot:activator="{ on, attrs }"
        )
          v-btn.ml-2(
            @click="createTextCard()"
            v-bind="attrs"
            v-on="on"
            icon
          )
            v-icon mdi-text-box-outline
        span Create text card
  v-dialog.dialog(
    v-if="currentCard"
    :value="!!currentCard"
    transition="dialog-bottom-transition"
    content-class="dialog"
    fullscreen
    hide-overlay
  )
    v-toolbar(
      color="primary"
      dark
    )
      v-btn(
        @click="$store.dispatch('setCurrentCard', null)"
        icon
        dark
      )
        v-icon mdi-close
    .d-flex.flex-center
      card(:card="currentCard")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import CardModel from '@/models/card'
import { State } from 'vuex-class'
import ListItemModel from '~/models/list-item'

@Component
export default class HeaderRowComponent extends Vue {
  @State(state => state.currentCard) currentCard!: CardModel

  createTextCard () {
    this.$store.dispatch('setCurrentCard', new CardModel({ type: CardModel.TYPE_TEXT }))
  }

  createListCard () {
    const card = new CardModel({ type: CardModel.TYPE_LIST })
    this.$store.dispatch('setCurrentCard', card)
    this.currentCard.addListItem(new ListItemModel({ card }))
  }
}
</script>

<style lang="stylus" scoped>
.header-row
::v-deep .dialog
  background-color #fff
</style>
