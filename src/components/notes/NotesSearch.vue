<template lang="pug">
.search
  q-input(
    v-model="globalStore.searchQuery"
    placeholder="Поиск..."
    color="grey-7"
    ref="inputElement"
    outlined
    dense
  )
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import BaseService from '~/services/base'
import KeyboardEvents from '~/helpers/keyboard-events'
import { useGlobalStore } from '~/stores/global'

const globalStore = useGlobalStore()
const inputElement = ref<HTMLInputElement | null>(null)

function handleEscapeButton(event: KeyboardEvent) {
  debugger
  if (KeyboardEvents.is(event, KeyboardEvents.ESCAPE)) {
    globalStore.searchQuery = ''
  }
}

onMounted(() => {
  console.log(inputElement.value)
  debugger
  inputElement.value?.addEventListener('keypress', handleEscapeButton)
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
