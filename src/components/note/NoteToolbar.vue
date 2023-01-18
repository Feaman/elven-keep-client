<template lang="pug">
.note-toolbar
  q-header.q-flex.flex-center(elevated)
    q-toolbar.note-toolbar__toolbar.full-width.pa-0
      .q-flex.full-width
        q-btn(
          @click="router.push('/')"
          :icon="mdiHome"
          color="black"
          flat
          round
        )
        q-separator(vertical)
        transition(
          appear
          enter-active-class="animated scaleFadeIn"
          leave-active-class="animated scaleFadeOut"
        )
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
        transition(
          appear
          enter-active-class="animated scaleFadeIn"
          leave-active-class="animated scaleFadeOut"
        )
          q-btn(
            v-if="note.id && note.isList && note.mainListItems.length"
            @click="emit('fullscreen')"
            :icon="mdiFullscreen"
            color="black"
            flat
            round
          )
        q-space
        transition(
          appear
          enter-active-class="animated scaleFadeIn"
          leave-active-class="animated scaleFadeOut"
        )
          NewVersionIcon(
            v-if="globalStore.isNewVersionAvailable"
          )
        transition(
          appear
          enter-active-class="animated scaleFadeIn"
          leave-active-class="animated scaleFadeOut"
        )
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
import { useGlobalStore } from '~/stores/global'
import { type TNoteModel } from '~/composables/models/note'

const router = useRouter()
const globalStore = useGlobalStore()

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
