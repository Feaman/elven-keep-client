<template lang="pug">
v-app
  app-bar
  v-main
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
import TypeService from '~/services/type'

@Component
export default class DefaultLayout extends Vue {
  loading = true
  created () {
    TypeService.getTypes()
      .then(() => CardService.getCards())
      .then(() => this.loading = false)
  }
}
</script>

<style lang="stylus" scoped>
</style>
