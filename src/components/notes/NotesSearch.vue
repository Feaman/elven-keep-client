<template lang="pug">
.search
  q-input(
    v-model="NotesService.searchQuery"
    placeholder="Поиск..."
    color="grey-7"
    outlined
    dense
  )
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import NotesService from '~/composables/services/notes'
import KeyboardEvents from '~/helpers/keyboard-events'

function handleEscapeButton(event: KeyboardEvent) {
  if (KeyboardEvents.is(event, KeyboardEvents.ESCAPE)) {
    NotesService.searchQuery.value = ''
  }
}

onMounted(() => {
  document.onkeydown = handleEscapeButton
})

onBeforeUnmount(() => {
  document.onkeydown = null
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
