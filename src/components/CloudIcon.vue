<template lang="pug">
.cloud-icon.row.flex-center
  q-btn(
    @click="handleClick"
    :icon="icon"
    :color="isSocketError || !store.isOnline ? 'red' : 'black'"
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
              color="red"
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
        .font-size-18 Seems like there is no Internet here. The application is working offline.
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  mdiAlertDecagram,
  mdiCloudUploadOutline,
  mdiCloudCheckOutline,
  mdiClose,
} from '@quasar/extras/mdi-v6'
import { useRoute } from 'vue-router'
import { type TNoteModel } from '~/composables/models/note'
import { useGlobalStore } from '~/stores/global'
import InitService from '~/services/init'
import BaseService from '~/services/base'
import SyncService from '~/services/sync'

const props = defineProps<{
  note?: TNoteModel,
}>()

const store = useGlobalStore()
const showDialog = ref(false)
const isSocketError = computed(() => store.isSocketError === true)
const icon = computed(() => {
  if (isSocketError.value || !store.isOnline) {
    return mdiAlertDecagram
  }

  return props.note?.isSaving ? mdiCloudUploadOutline : mdiCloudCheckOutline
})
const tooltipText = computed(() => {
  if (isSocketError.value || !store.isOnline) {
    return 'Connection error, click for information.'
  }

  return props.note?.isSaving ? 'Saving to cloud' : 'Saved to cloud'
})

function handleClick() {
  if (isSocketError.value || !store.isOnline) {
    showDialog.value = true
  }
}

function reloadPage() {
  window.location.reload()
}
</script>

<style lang="scss" scoped>

</style>
