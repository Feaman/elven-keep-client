<template lang="pug">
.create-tools
  q-btn(
    @click="router.push('/new/list')"
    :icon="mdiFormatListBulletedSquare"
    color="black"
    flat
    round
  )
    ToolTip Create list note
  q-btn(
    @click="router.push('/new/text')"
    :icon="mdiTextBoxOutline"
    color="black"
    flat
    round
  )
    ToolTip Create text note
</template>

<script setup lang="ts">
import {
  mdiFormatListBulletedSquare,
  mdiTextBoxOutline,
} from '@quasar/extras/mdi-v6'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style lang="scss" scoped>
.create-tools {
  min-width: 84px;
}
</style>
