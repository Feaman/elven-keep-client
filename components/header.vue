<template lang="pug">
.header.align-center
  .title NOTES
  search
</template>

<style lang="stylus" scoped>
@import '~assets/css/mixins'

.header
  height 80px
  padding 0 0 0 24px
  background-color #007b76
  box-shadow 0 0 5px #000

  .title
    color #fff
    font-size 24px
    text-shadow 2px 1px 1px #000
    font-weight bold

  .search
    margin 0 0 0 24px
</style>
