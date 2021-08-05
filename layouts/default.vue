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
    nuxt(
      v-else
    )
</template>

<script lang="ts">
import Vue from 'vue'
import { State } from 'vuex-class'
import Component from 'vue-class-component'

@Component
export default class DefaultLayout extends Vue {
  @State(state => state.isInitInfoLoading) isInitInfoLoading!: boolean

  mounted () {
    this.handleWindowResize()
    window.addEventListener('resize', this.handleWindowResize)
  }

  handleWindowResize () {
    // Fix 100vh for mobile
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
  }
}
</script>

<style lang="stylus" scoped>
::v-deep .v-main__wrap
  height 100vh
  height calc(var(--vh, 1vh) * 100)
  transition height 0.1s
</style>
