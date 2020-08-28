<template lang="pug" >
  div
    header-row
    cards
</template>

<script lang="ts" >
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Index extends Vue {
}
</script>

<style lang="stylus" scoped >
.container
  height calc(100vh - 80px)

  .left, .right
    width 50%
    height 100%

.footer
  height 80px

  .button
    width 240px
    height 40px
    box-shadow 0 0 5px rgba(0, 0, 0, 0.5)
    font-weight bold
    border-radius 6px
</style>
