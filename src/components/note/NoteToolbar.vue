<template lang="pug">
.note-toolbar
  q-header.q-flex.flex-center(elevated)
    q-toolbar.note-toolbar__toolbar.full-width.pa-0
      .q-flex.full-width
        q-btn(
          @click="goToMainPage()"
          :icon="mdiHome"
          color="black"
          flat
          round
        )
        q-separator(vertical)
        transition(
          :name="isNewNoteRoute ? 'scale-fade' : undefined"
        )
          q-btn(
            v-if="note.id && globalStore.isOnline"
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
          :name="isNewNoteRoute ? 'scale-fade' : undefined"
        )
          q-btn(
            v-if="note.id && note.isList && note.mainListItems.length"
            @click="emit('fullscreen')"
            :icon="mdiFullscreen"
            color="black"
            flat
            round
          )
        q-btn(
          v-if="Number(globalStore.user.id) === 1"
          @click="setWatchMode(true); emit('fullscreen')"
          :icon="mdiWatch"
          color="black"
          flat
          round
        )
        q-space
        transition(
          name="scale-fade"
        )
          NewVersionIcon(
            v-if="globalStore.isNewVersionAvailable"
          )
        transition(
          :name="isNewNoteRoute ? 'scale-fade' : undefined"
        )
          CloudIcon(
            v-if="note.id"
            :note="note"
          )
        q-separator(vertical)
        UserMenu
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import {
  mdiHome,
  mdiAccountGroup,
  mdiFullscreen,
  mdiWatch,
} from '@quasar/extras/mdi-v6'
import { computed } from 'vue'
import { version } from '../../../package.json'
import { useGlobalStore } from '~/stores/global'
import { type TNoteModel } from '~/composables/models/note'
import { ROUTE_NEW, ROUTE_NOTES } from '~/router/routes'
import BaseService from '~/services/base'

const router = useRouter()
const globalStore = useGlobalStore()
const route = useRoute()

function setWatchMode(isWatchMode: boolean) {
  BaseService.setWatchMode(isWatchMode)
}

function goToMainPage() {
  const query: { 'is-watch'?: string } = {}
  if (globalStore.isWatchMode) {
    query['is-watch'] = globalStore.isWatchMode ? '1' : '0'
  }
  router.push({ name: ROUTE_NOTES, query })
}

// eslint-disable-next-line
const emit = defineEmits<{
  (event: 'fullscreen'): void
  (event: 'co-authors-clicked'): void
}>()

defineProps<{
  note: TNoteModel,
}>()

const isNewNoteRoute = computed(() => route.name === ROUTE_NEW)
</script>

<style lang="scss" scoped>
.note-toolbar__toolbar {
  max-width: 900px;
}
</style>
