<template lang="pug">
.search
  q-input(
    v-model="searchQuery"
    placeholder="Поиск..."
    color="grey-7"
    clearable
    outlined
    dense
  )
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { searchQuery } from '~/composables/services/notes'
import KeyboardEvents from '~/helpers/keyboard-events'
import BaseService from '~/services/base'

function handleEscapeButton(event: KeyboardEvent) {
  if (KeyboardEvents.is(event, KeyboardEvents.ESCAPE)) {
    searchQuery.value = ''
  }
}

onMounted(() => {
  BaseService.eventBus.on('keydown', handleEscapeButton)
})
</script>

<style lang="scss" scoped>
.search {
  input {
    width: 240px;
    height: 40px;
    padding: 0 16px;
    border: none;
    border-radius: 6px;
    outline: none;
  }
}
</style>
