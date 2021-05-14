<template lang="pug">
v-app
  v-main
    .content
      v-progress-circular(
        v-if="loading"
        color="primary"
        indeterminate
      )
      nuxt(v-else)
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import CardService from '~/services/card'

@Component
export default class CardsComponent extends Vue {
  loading = true
  created () {
    CardService.getCards()
      .then(() => this.loading = false)
  }
}
</script>

<style lang="stylus" scoped>
@import '~assets/css/mixins'

.container
  height 100vh

  .loader-container
    height 100%

    .loader
      loader(#000, 100px, 16px)
</style>
