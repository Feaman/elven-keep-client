<template lang="pug">
.container
  .loader-container.center(
    v-if="loading"
  )
    .loader
  Nuxt(
    v-else
  )
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import BaseService from '~/services/base'

@Component
export default class CardsComponent extends Vue {
  loading = true
  created () {
    BaseService.initData()
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
