<template lang="pug">
.new-version-icon.row.flex-center
  q-btn(
    @click="showDialog = true"
    :icon="mdiAlert"
    color="purple"
    flat
    round
  )
    ToolTip New version available

  q-dialog(
    :model-value="showDialog"
    transition-show="flip-up"
    transition-hide="flip-down"
  )
    q-card
      q-toolbar.q-flex.bg-primary.shadow-3
        q-toolbar-title.ml-2
          .q-flex.items-center
            q-icon(
              :name="mdiAlert"
              size="sm"
            )
            .font-size-18.ml-2 A new version available
        q-btn(
          @click="showDialog = false"
          :icon="mdiClose"
          color="black"
          flat
          round
          dense
        )
      .pa-6
        .font-size-18 A new version of the application available.
        q-btn.text-black.mt-4(
          @click="reloadPage"
          color="primary"
        ) Update
        q-btn.text-black.mt-4.ml-4(
          @click="showDialog = false"
          color="grey-4"
        ) Cancel
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  mdiAlert,
  mdiClose,
} from '@quasar/extras/mdi-v6'

const showDialog = ref(false)

function reloadPage() {
  window.location.reload()
}
</script>
