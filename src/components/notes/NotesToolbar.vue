<template lang="pug">
.notes-toolbar
  q-header(
    elevated
  )
    q-toolbar.ml-2
      .q-flex.align-center.full-width
        NotesSearch
        .toolbar-tools.d-flex
          q-btn.ml-2(
            @click="router.push('/new/list')"
            :icon="mdiFormatListBulletedSquare"
            color="black"
            flat
            round
          )
            ToolTip Create list note
          q-btn(
            @click="router.push('/new/text')"
            :icon="mdiTextBoxOutline"
            color="black"
            flat
            round
          )
            ToolTip Create text note
        q-space
        user-menu
</template>

<script setup lang="ts">
import { mdiFormatListBulletedSquare, mdiTextBoxOutline } from '@quasar/extras/mdi-v6'
import { useRouter } from 'vue-router'

const router = useRouter()
// function goToPage(page: string) {
// router.push(page)
// }
</script>

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
