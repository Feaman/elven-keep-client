<template lang="pug">
.cloud-icon.row.flex-center
  q-btn(
    @click="handleClick"
    :icon="icon"
    :color="isSocketError ? 'red' : 'black'"
    flat
    round
  )
    ToolTip {{ tooltipText }}
</template>

<script setup lang="ts">
import {
  mdiAlertDecagram,
  mdiCloudUploadOutline,
  mdiCloudCheckOutline,
} from '@quasar/extras/mdi-v6'
import { computed } from 'vue'
import { type TNoteModel } from '~/composables/models/note'
import { useGlobalStore } from '~/stores/global'

const props = defineProps<{
  note?: TNoteModel,
}>()

const isSocketError = computed(() => useGlobalStore().isSocketError === true)
const icon = computed(() => {
  if (isSocketError.value) {
    return mdiAlertDecagram
  }

  return props.note?.isSaving ? mdiCloudUploadOutline : mdiCloudCheckOutline
})
const tooltipText = computed(() => {
  if (isSocketError.value) {
    return 'Connection error, click to reload the page'
  }

  return props.note?.isSaving ? 'Saving to cloud' : 'Saved to cloud'
})

function handleClick() {
  if (isSocketError.value) {
    window.location.reload()
  }
}
</script>

<style lang="scss" scoped>

</style>
