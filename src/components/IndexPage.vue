<template lang="pug">
.index-page.q-ma-lg
  q-header(
    elevated
  )
    q-toolbar
      .row.flex-center.full-width
        q-btn(
          color="black"
          icon="home"
          flat
        )
        q-btn(
          color="black"
          icon="home"
          flat
        )
        q-btn(
          color="black"
          icon="home"
          flat
        )
        q-btn(
          color="black"
          icon="home"
          flat
        )
        q-btn(
          color="black"
          icon="home"
          flat
        )
        q-btn(
          color="black"
          icon="home"
          flat
        )
  .row
    NotePreview(
      v-for="note in notes"
      :key="note.id"
      :note="note"
    )
      q-card-section {{ note.title }}
</template>

<script setup lang="ts">
import { useNotesStore } from '~/stores/notes'

const { notes } = useNotesStore()
</script>

<style lang="scss" scoped>
.index-page {}
</style>
