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

  q-dialog(
    @hide="showDialog = false"
    :model-value="showDialog"
    transition-show="flip-up"
    transition-hide="flip-down"
  )
    q-card
      q-toolbar.q-flex.bg-primary.shadow-3
        q-toolbar-title.ml-2
          .q-flex.items-center
            q-icon(
              :name="mdiAlertDecagram"
              size="sm"
            )
            .font-size-18.ml-2 Connection error
        q-btn(
          @click="showDialog = false"
          :icon="mdiClose"
          color="black"
          flat
          round
          dense
        )
      .pa-6
        .font-size-18 There's something about your Internet connection. Check your Internet.
        q-btn.text-black.mt-4(
          @click="reloadPage"
          color="primary"
        ) Reload page
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  mdiAlertDecagram,
  mdiCloudUploadOutline,
  mdiCloudCheckOutline,
  mdiClose,
} from '@quasar/extras/mdi-v6'
import { type TNoteModel } from '~/composables/models/note'
import { useGlobalStore } from '~/stores/global'

const props = defineProps<{
  note?: TNoteModel,
}>()

const showDialog = ref(false)
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
    showDialog.value = true
  }
}

function reloadPage() {
  window.location.reload()
}
</script>

<style lang="scss" scoped>

</style>
