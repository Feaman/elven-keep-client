<template lang="pug">
.fullscreen-view.full-width
  q-dialog(
    @update:model-value="emit('close')"
    @close:model-value="emit('close')"
    @hide="emit('close')"
    :model-value="show"
    :maximized="true"
    transition-show="flip-up"
    transition-hide="flip-down"
    seamless
  )
    q-card.full-width.full-height.q-flex.justify-center
      q-card-section.fullscreen__card-section.full-height.column.no-wrap.pa-4.px-6
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
.fullscreen-view {}

.fullscreen__card-section {
  max-width: 900px;
  width: 100%;
  overflow: auto;
}
</style>
