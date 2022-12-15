<template lang="pug">
.notes-toolbar
  q-header.notes-toolbar__header(elevated)
    q-toolbar.ml-2
      .q-flex.align-center.full-width
        NotesSearch
        CreateTools
        q-space
        user-menu
</template>

<script setup lang="ts">
import { mdiFormatListBulletedSquare, mdiTextBoxOutline } from '@quasar/extras/mdi-v6'
import { useRouter } from 'vue-router'
import CreateTools from '../CreateTools.vue'

const router = useRouter()
// function goToPage(page: string) {
// router.push(page)
// }
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
