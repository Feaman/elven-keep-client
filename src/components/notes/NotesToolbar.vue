<template lang="pug">
.notes-toolbar
  q-header.notes-toolbar__header(elevated)
    q-toolbar.pr-0
      .q-flex.full-width
        NotesSearch
        CreateTools
        q-btn(
          v-if="Number(globalStore.user.id) === 1"
          @click="switchWatchMode(true)"
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
        CloudIcon
        q-separator(vertical)
        user-menu
</template>

<script setup lang="ts">
import { mdiWatch } from '@quasar/extras/mdi-v6'
import CreateTools from '../CreateTools.vue'
import { useGlobalStore } from '~/stores/global'
import BaseService from '~/services/base'

const globalStore = useGlobalStore()

function switchWatchMode() {
  BaseService.switchWatchMode()
}
</script>
