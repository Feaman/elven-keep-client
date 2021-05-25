<template lang="pug">
v-app
  v-main
    .d-flex.fill-height.flex-center(
      v-if="isInitInfoLoading"
    )
      v-progress-circular(
        color="primary"
        indeterminate
      )
    nuxt
</template>

<script lang="ts">
import Vue from 'vue'
import { State } from 'vuex-class'
import Component from 'vue-class-component'

@Component
export default class DefaultLayout extends Vue {
  @State(state => state.isInitInfoLoading) isInitInfoLoading!: boolean
}
</script>

<style lang="stylus" scoped>
::v-deep .v-main__wrap
  height 100vh
</style>
