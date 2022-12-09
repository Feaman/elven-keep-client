<template lang="pug">
.search
  q-input(
    v-model="globalStore.searchQuery"
    placeholder="Поиск..."
    color="grey-7"
    outlined
    dense
  )
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import BaseService from '~/services/base'
import KeyboardEvents from '~/helpers/keyboard-events'
import { useGlobalStore } from '~/stores/global'

const globalStore = useGlobalStore()

function handleEscapeButton(event: KeyboardEvent) {
  if (KeyboardEvents.is(event, KeyboardEvents.ESCAPE)) {
    globalStore.searchQuery = ''
  }
}

onMounted(() => {
  BaseService.eventBus.on('keydown', handleEscapeButton)
})

onBeforeUnmount(() => {
  BaseService.eventBus.off('keydown', handleEscapeButton)
})
</script>

<style lang="stylus" scoped>
.search
  input
    width 240px
    height 40px
    padding 0 16px
    border none
    border-radius 6px
    outline none
</style>
