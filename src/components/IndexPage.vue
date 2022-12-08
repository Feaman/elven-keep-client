<template lang="pug">
.index-page.q-ma-lg.full-height
  notes-toolbar.full-width
  transition-group.row.wrap.q-pr-xs.q-pb-xs.q-mt-sm(
    name="horizontal-list-effect"
    tag="div"
  )
    .note.q-ml-xs.q-mt-xs.q-pa-xs(
      v-for="note in filtered"
      :key="note.id"
    )
      NotePreview(
        @click="openNote(note)"
        @remove="NotesService.removeNote(note)"
        :note="note"
      )

</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NotesService from '~/composables/services/notes'
import type { NoteModel } from '~/composables/models/note'

const { filtered } = NotesService

function openNote(note: NoteModel) {
  useRouter().push(`/note/${note.id}`)
}

onMounted(() => {
  // this.$el.addEventListener('scroll', this.setMainListScroll)
  // this.$el.scrollTo({ top: this.$store.state.mainListScrollTop })
})
</script>

<style lang="scss" scoped>
.index-page {
  overflow: auto;

  .note {
    min-width: 250px;
    max-width: 300px;
    height: 260px;
    flex: 1;
  }

  @media (max-width: 700px) {
    .note {
      min-width: 148px;
    }
  }
}
</style>
