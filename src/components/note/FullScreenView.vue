<template lang="pug">
.fullscreen-view
  q-dialog(
    :maximized="true"
    transition-show="scale"
    transition-hide="jump-left"
    @update:model-value="emit('close')"
    :model-value="show"
  )
    q-card.fullscreen__card.full-height
      q-card-section.full-height.column.no-wrap.pa-4.px-6
        NoteList(
          @check="emit('list-item-check', $event)"
          @uncheck="emit('list-item-uncheck', $event)"
          :note="note"
          is-main
          fullscreen
        )
        q-space
        .text-center.pb-4
          q-btn(
            @click="emit('close')"
            :icon="mdiCheck"
            size="lg"
            color="green"
            round
          )
</template>

<script setup lang="ts">
import { mdiCheck } from '@quasar/extras/mdi-v6'
import { type TListItemModel } from '~/composables/models/list-item'
import { type TNoteModel } from '~/composables/models/note'

defineProps<{
  note: TNoteModel
  show: boolean
}>()

// eslint-disable-next-line
const emit = defineEmits<{
  (event: 'close'): void
  (event: 'list-item-check', listItem: TListItemModel): void
  (event: 'list-item-uncheck', listItem: TListItemModel): void
}>()
</script>

<style lang="scss" scoped>
.fullscreen-view {
  .fullscreen__card {
    overflow: auto;
  }
}
</style>
