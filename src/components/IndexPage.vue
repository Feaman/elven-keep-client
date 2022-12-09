<template lang="pug">
.index-page.full-height(ref="rootElement")
  NotesToolbar.full-width
  transition-group.row.pr-4.pb-4.mt-2(
    name="horizontal-list-effect"
    tag="div"
  )
    .note.ml-4.mt-4.pa-1(
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
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NotesService from '~/composables/services/notes'
import type { NoteModel } from '~/composables/models/note'
import { useGlobalStore } from '~/stores/global'

const { filtered } = NotesService
const rootElement = ref<HTMLElement | null>(null)
const globalStore = useGlobalStore()
const router = useRouter()
let scrollTimeout: ReturnType<typeof setTimeout> | null = null

function openNote(note: NoteModel) {
  router.push(`/note/${note.id}`)
}

function setMainListScroll() {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  scrollTimeout = setTimeout(() => {
    globalStore.mainListScrollTop = rootElement.value ? rootElement.value.scrollTop : 0
  }, 100)
}

onMounted(() => {
  rootElement.value?.addEventListener('scroll', setMainListScroll)
  rootElement.value?.scrollTo({ top: globalStore.mainListScrollTop })
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
