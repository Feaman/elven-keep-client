<template lang="pug">
.note-page.full-height(
  v-if="currentNote"
)
  NoteToolbar(
    @fullscreen="fullscreen = true"
    @is-watch="isWatch = true"
    @co-authors-clicked="showAuthors = true"
    :note="currentNote"
  ).full-width
  Note(
    @fullscreen="fullscreen = $event"
    @is-watch="isWatch = $event"
    @hide-authors="showAuthors = false"
    :is-watch="isWatch"
    :fullscreen="fullscreen"
    :show-authors="showAuthors"
  )
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import noteModel, { type TNoteModel } from '~/composables/models/note'
import { TYPE_LIST, TYPE_TEXT } from '~/composables/models/type'
import NotesService from '~/composables/services/notes'
import TypesService from '~/composables/services/types'
import KeyboardEvents from '~/helpers/keyboard-events'
import BaseService from '~/services/base'
import { useGlobalStore } from '~/stores/global'

const { currentNote } = NotesService
const globalStore = useGlobalStore()
const route = useRoute()
const router = useRouter()
const fullscreen = ref(false)
const isWatch = ref(false)
const showAuthors = ref(false)

function init() {
  if (['/new/list', '/new/text'].includes(route.path)) {
    const type = route.path === '/new/list' ? TYPE_LIST : TYPE_TEXT
    const note = noteModel({
      typeId: TypesService.findByName(type).id,
      userId: globalStore.user?.id,
      order: NotesService.generateMaxOrder(),
    }) as unknown as TNoteModel
    note.handleDataTransformation()
    note.user = globalStore.user
    NotesService.notes.value.push(note as unknown as TNoteModel)
    currentNote.value = note
  } else if (/^\/note\/\d+$/.test(route.path)) {
    const foundNote = NotesService.notes.value.find((note: TNoteModel) => note.id === Number(route.params.id))
    if (!foundNote) {
      BaseService.showError({ statusCode: 404, message: `Note width id "${route.params.id}" not found` })
      return
    }
    currentNote.value = foundNote
  }
}

function handleEscapeButton() {
  const focusedListItem = currentNote.value?.list.find((listItem) => listItem.focused)
  const activeElementTagName = document.activeElement?.tagName.toLowerCase()
  if (focusedListItem) {
    focusedListItem.focused = false
  } else if (['input', 'textarea'].includes(activeElementTagName || '')) {
    (document.activeElement as HTMLInputElement | HTMLTextAreaElement).blur()
  } else {
    router.push('/')
  }
}

function handleKeyDown(event: KeyboardEvent) {
  switch (true) {
    case KeyboardEvents.is(event, KeyboardEvents.ESCAPE):
      handleEscapeButton()
      break
  }
}

init()

watch(
  route,
  () => {
    init()
  },
)

onMounted(() => {
  BaseService.eventBus.on('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  if (!currentNote.value?.id) {
    NotesService.notes.value = NotesService.notes.value.filter((_note) => _note.id !== currentNote.value?.id)
  }
})
</script>
