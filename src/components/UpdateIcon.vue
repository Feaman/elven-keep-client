<template lang="pug">
.new-version-icon.row.flex-center
  q-btn(
    :icon="mdiRefresh"
    color="green-7"
    flat
    round
  )
</template>

<script setup lang="ts">
import {
  mdiRefresh,
} from '@quasar/extras/mdi-v6'
</script>
