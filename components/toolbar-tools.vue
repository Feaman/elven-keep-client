<template lang="pug">
  .toolbar-tools.d-flex
    v-tooltip(
      bottom
    )
      template(
        v-slot:activator="{ on, attrs }"
      )
        v-btn.ml-2(
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
        v-btn(
          @click="$router.push('/new/text')"
          v-bind="attrs"
          v-on="on"
          icon
        )
          v-icon mdi-text-box-outline
      span Create text note
</template>
