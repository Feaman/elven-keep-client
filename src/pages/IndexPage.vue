<template lang="pug">
.index-page.full-height(ref="rootElement")
  NotesToolbar.full-width
  template(v-if="filtered?.length")
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
              @remove="removeNote(element)"
              :note="element"
            )
  template(v-else)
    .no-data.full-height.q-flex.column
      .no-data__text.pt-16.px-10
        .text-center No notes found. <br>Try to create one!
      .justify-center.column.mt-8.self-center
        q-btn(
          @click="router.push('/new/text')"
          color="amber"
          text-color="black"
        )
          div CREATE TEXT NOTE
        q-btn.mt-4.self-center(
          @click="router.push('/new/list')"
          color="amber"
          text-color="black"
        )
          div CREATE LIST NOTE
      .no-data__image.row.flex-center.full-width.col
        img(
          src="/images/no-data.jpg"
        )
  </template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import draggable from 'zhyswan-vuedraggable'
import NotesService from '~/composables/services/notes'
import { type TNoteModel } from '~/composables/models/note'
import { useGlobalStore } from '~/stores/global'
import BaseService from '~/services/base'

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
  if (note.isLocalModel) {
    window.location.href = `/note/${note.id}`
  } else {
    router.push(`/note/${note.id}`)
  }
}

async function removeNote(note: TNoteModel) {
  try {
    await NotesService.removeNote(note)
  } catch (error) {
    BaseService.eventBus.emit('showGlobalError', { statusCode: 500, message: (error as Error).message })
  }
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

  .no-data {
    img {
      width: 30%;
      max-width: 600px;
      margin-top: -40px;
    }
  }

  @media (max-width: 700px) {
    .note {
      min-width: 148px;
    }

    .no-data {
      img {
        width: 60%;
      }
    }
  }
}
</style>
