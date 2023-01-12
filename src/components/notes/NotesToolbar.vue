<template lang="pug">
.notes-toolbar
  q-header.notes-toolbar__header(elevated)
    q-toolbar
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

</style>
