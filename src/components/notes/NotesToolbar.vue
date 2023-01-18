<template lang="pug">
.notes-toolbar
  q-header.notes-toolbar__header(elevated)
    q-toolbar
      .q-flex.full-width
        NotesSearch
        CreateTools
        q-space
        transition(
          appear
          enter-active-class="animated scaleFadeIn"
          leave-active-class="animated scaleFadeOut"
        )
          NewVersionIcon(
            v-if="globalStore.isNewVersionAvailable"
          )
        CloudIcon
        q-separator(vertical)
        user-menu
</template>

<script setup lang="ts">
import CreateTools from '../CreateTools.vue'
import { useGlobalStore } from '~/stores/global'

const globalStore = useGlobalStore()
</script>
