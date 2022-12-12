<template lang="pug">
.note-toolbar
  q-header.q-flex.flex-center(
    elevated
  )
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
        q-btn(
          @click="$emit('co-authors-clicked')"
          :icon="mdiAccountGroup"
          color="black"
          flat
          round
        )
          ToolTip Manage authors
        q-separator(vertical)
        CreateTools
        q-separator(vertical)
        q-space
        q-btn(
          @click="$emit('fullscreen', note)"
          :icon="mdiFullscreen"
          color="black"
          flat
          round
        )
        q-btn(
          v-if="note.id"
          :icon="note.isSaving ? mdiCloudUploadOutline : mdiCloudCheckOutline"
          color="black"
          flat
          round
        )
          ToolTip {{ note.isSaving ? 'Saving to cloud' : 'Saved to cloud' }}
            q-separator(vertical)
            q-space
        q-separator(vertical)
        UserMenu
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  mdiCloudUploadOutline,
  mdiCloudCheckOutline,
  mdiHome,
  mdiAccountGroup,
  mdiFullscreen,
} from '@quasar/extras/mdi-v6'
import { type TNoteModel } from '~/composables/models/note'

const router = useRouter()

defineProps<{
  note: TNoteModel,
}>()
</script>

<style lang="scss" scoped>
.note-toolbar__toolbar {
  max-width: 900px;
}
</style>
