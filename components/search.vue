<template lang="pug">
.search
  v-text-field(
    @input="handleSearch($event)"
    :value="searchQuery"
    placeholder="Поиск..."
    hide-details
    outlined
    clearable
    dense
  )
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import BaseService from '~/services/base'
import KeyboardEvents from '~/services/keyboard-events'

@Component
export default class SearchComponent extends Vue {
  @State searchQuery!: string

  mounted () {
    BaseService.events.$on(
      'keydown',
      (event: KeyboardEvent) => {
        if (KeyboardEvents.is(event, KeyboardEvents.ESCAPE)) {
          this.$store.dispatch('setQuerySearch', '')
        }
      })
  }

  handleSearch (searchQuery: string) {
    this.$store.dispatch('setQuerySearch', searchQuery)
  }
}
</script>

<style lang="stylus" scoped>
@import '~assets/css/mixins'

.search
  input
    width 240px
    height 40px
    padding 0 16px
    border none
    border-radius 6px
    outline none
</style>
