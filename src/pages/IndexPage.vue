<template lang="pug">
.index-page.full-height(ref="rootElement")
  NotesToolbar.full-width
  .row.pr-4.pb-4
    draggable(
      v-model="filtered"
      :set-data="setDragGhostData"
      :component-data="{ name: 'horizontal-list-effect' }"
      :delay="1000"
      @start="drag = true"
      @end="drag = false"
      tag="transition-group"
      item-key="id"
    )
      template(
        #item="{element}"
      )
        .note.ml-4.mt-4.pa-1
          NotePreview(
            @click="openNote(element)"
            @remove="NotesService.removeNote(element)"
            :note="element"
          )
  </template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import draggable from 'zhyswan-vuedraggable'
import NotesService from '~/composables/services/notes'
import { type TNoteModel } from '~/composables/models/note'
import { useGlobalStore } from '~/stores/global'

const { filtered } = NotesService
const rootElement = ref<HTMLElement | null>(null)
const globalStore = useGlobalStore()
const router = useRouter()
const drag = ref(false)
let scrollTimeout: ReturnType<typeof setTimeout> | null = null

function setDragGhostData(dataTransfer: DataTransfer) {
  dataTransfer.setDragImage(document.createElement('div'), 0, 0)
}

function openNote(note: TNoteModel) {
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
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
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
