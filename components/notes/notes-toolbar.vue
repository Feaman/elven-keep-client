<template lang="pug">
.notes-toolbar
  v-toolbar(
    color="primary"
    dark
  )
    .d-flex.align-center.fill-width
      search
      toolbar-tools
      v-spacer
      user-menu
</template>

<style lang="stylus" scoped>
.notes-toolbar
  position absolute
  z-index 100

::v-deep .v-toolbar__content
  width 100%
  padding: 4px 2px 4px 16px

  .v-toolbar
    z-index 20
</style>
