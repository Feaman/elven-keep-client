<template lang="pug">
.search
  input(
    @input="handleSearch($event)"
    :value="searchQuery"
  )
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class CardsComponent extends Vue {
  @State searchQuery!: string

  handleSearch (event: Event) {
    if (event.target && event.target instanceof HTMLInputElement) {
      this.$store.dispatch('setQuerySearch', event.target.value)
    }
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
    font-family()
</style>
