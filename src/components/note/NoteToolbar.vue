<template lang="pug">
.note-toolbar
  q-header.q-flex.flex-center(elevated)
    q-toolbar.note-toolbar__toolbar.full-width.pa-0
      .q-flex.align-center.full-width
        q-btn(
          @click="router.push('/')"
          :icon="mdiHome"
          color="black"
          flat
          round
        )
        q-separator(vertical)
        transition(name="horizontal-list")
          q-btn(
            v-if="note.id"
            @click="emit('co-authors-clicked')"
            :icon="mdiAccountGroup"
            color="black"
            flat
            round
          )
            ToolTip Manage authors
        q-separator(vertical)
        CreateTools
        q-separator(vertical)
        transition(name="horizontal-list")
          q-btn(
            v-if="note.id && note.isList && note.mainListItems.length"
            @click="emit('fullscreen')"
            :icon="mdiFullscreen"
            color="black"
            flat
            round
          )
        q-space
        transition(name="horizontal-list" tag="div")
          CloudIcon(
            v-if="note.id"
            :note="note"
          )
        q-separator(vertical)
        UserMenu
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  mdiHome,
  mdiAccountGroup,
  mdiFullscreen,
} from '@quasar/extras/mdi-v6'
import { type TNoteModel } from '~/composables/models/note'

const router = useRouter()

// eslint-disable-next-line
const emit = defineEmits<{
  (event: 'fullscreen'): void
  (event: 'co-authors-clicked'): void
}>()

defineProps<{
  note: TNoteModel,
}>()
</script>

<style lang="scss" scoped>
.note-toolbar__toolbar {
  max-width: 900px;
}
</style>
