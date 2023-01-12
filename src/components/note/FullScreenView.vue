<template lang="pug">
.fullscreen-view.full-width
  q-dialog(
    @update:model-value="emit('close')"
    @close:model-value="emit('close')"
    @hide="emit('close')"
    :model-value="show"
    :maximized="true"
    transition-show="slide-right"
    transition-hide="slide-left"
    seamless
  )
    q-card.full-width.full-height.q-flex.justify-center
      q-card-section.fullscreen__card-section.full-height.column.no-wrap.pa-4.px-6
        TransitionGroup(
          name="vertical-list"
        )
          .list-item.q-flex.items-center(
            v-for="listItem in note.mainListItems"
            :key="listItem.generatedId"
            :class="{ 'list-item--checked': listItem.checked}"
          )
            q-checkbox(
              @update:model-value="note.checkOrUncheckListItem(listItem, $event)"
              :model-value="listItem.checked"
              color="blue"
            )
            .list-item__text.ml-1 {{ listItem.text }}
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
import { unref } from 'vue'
import { type TListItemModel } from '~/composables/models/list-item'
import { type TNoteModel } from '~/composables/models/note'
import NotesService from '~/composables/services/notes'

defineProps<{
  show: boolean
}>()

// eslint-disable-next-line
const emit = defineEmits<{
  (event: 'close'): void
  (event: 'list-item-check', listItem: TListItemModel): void
  (event: 'list-item-uncheck', listItem: TListItemModel): void
}>()

const note = unref(NotesService.currentNote as unknown as TNoteModel)
</script>

<style lang="scss" scoped>
.fullscreen__card-section {
  max-width: 900px;
  width: 100%;
  overflow: auto;

  .list-item {
    &.list-item--checked {
      color: $grey-4;
      text-decoration: line-through;
      transition: color 0.2s;
    }

    .list-item__text {
      overflow: auto;
    }

    &:not(:last-child) {
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
