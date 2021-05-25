<template lang="pug">
.notes-toolbar
  v-toolbar(
    color="primary"
    dark
  )
    .d-flex.align-center
      search
      v-tooltip(
        bottom
      )
        template(
          v-slot:activator="{ on, attrs }"
        )
          v-btn.ml-4(
            @click="$router.push('/new/list')"
            v-bind="attrs"
            v-on="on"
            icon
          )
            v-icon mdi-format-list-bulleted-square
        span Create list note
      v-tooltip(
        bottom
      )
        template(
          v-slot:activator="{ on, attrs }"
        )
          v-btn.ml-2(
            @click="$router.push('/new/text')"
            v-bind="attrs"
            v-on="on"
            icon
          )
            v-icon mdi-text-box-outline
        span Create text note
</template>

<style lang="stylus" scoped>
.notes-toolbar
  position absolute
  z-index 100

::v-deep .dialog
  background-color #fff

  .v-toolbar
    z-index 20

@media (max-width: 600px)
  .app-bar
    .logo
      display none

    .search
      margin-left 0
</style>
