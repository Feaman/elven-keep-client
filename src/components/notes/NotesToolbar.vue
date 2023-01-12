<template lang="pug">
.notes-toolbar
  q-header.notes-toolbar__header(elevated)
    q-toolbar.ml-2
      .q-flex.align-center.full-width
        NotesSearch
        CreateTools
        q-space
        CloudIcon
        q-separator(vertical)
        user-menu
</template>

<script setup lang="ts">
import CreateTools from '../CreateTools.vue'
</script>

<style lang="scss" scoped>
.notes-toolbar {
  height: 50px;
  position: absolute;

  .notes-toolbar__header {
    z-index: 3000;
  }
}
</style>
