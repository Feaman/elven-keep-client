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
    q-card.full-width.full-height.q-flex.justify-center(
      :class="{ 'is-watch': globalStore.isWatchMode }"
    )
      q-card-section.fullscreen__card-section.full-height.column.no-wrap.pb-4.px-2(
        :class="{ 'q-pt-none': globalStore.isWatchMode }"
      )
        .watch-buttons.watch-buttons--top.text-center(
          v-if="globalStore.isWatchMode"
        )
          q-icon(
            @click="emit('close')"
            :name="mdiCheck"
            color="black"
            size="68px"
          )
          q-icon(
            @click="note.completeAllChecked()"
            :name="mdiCheckAll"
            color="black"
            size="68px"
          )
        TransitionGroup(
          name="vertical-list"
        )
          .list-item.q-flex(
            v-for="listItem in note.mainListItems"
            @click="note.checkOrUncheckListItem(listItem, !listItem.checked)"
            :key="listItem.generatedId"
            :class="{ 'list-item--checked': listItem.checked}"
          )
            q-checkbox.ml-1(
              v-if="!globalStore.isWatchMode"
              @update:model-value="note.checkOrUncheckListItem(listItem, $event)"
              :model-value="listItem.checked"
              color="blue"
            )
            .list-item__text.full-width.q-flex.items-center.ml-1(
              :class="globalStore.isWatchMode ? `py-5 text-${listItem.checked ? 'grey' : ''}` : `py-2 text-grey-${listItem.checked ? '4' : '9'}`"
            ) {{ listItem.text }}
        q-space
        .watch-buttons.watch-buttons--bottom.text-center(
          v-if="globalStore.isWatchMode"
        )
          q-icon.pt-2(
            @click="emit('close')"
            :name="mdiCheck"
            color="black"
            size="68px"
          )
          q-icon.pt-2(
            @click="note.completeAllChecked()"
            :name="mdiCheckAll"
            color="black"
            size="68px"
          )
        .text-center.pt-6.pb-4(
          v-if="!globalStore.isWatchMode"
        )
          q-btn(
            @click="emit('close')"
            :icon="mdiCheck"
            size="lg"
            color="green"
            round
          )
</template>

<script setup lang="ts">
import { mdiCheck, mdiCheckAll } from '@quasar/extras/mdi-v6'
import { ref, unref } from 'vue'
import { type TListItemModel } from '~/composables/models/list-item'
import { type TNoteModel } from '~/composables/models/note'
import NotesService from '~/composables/services/notes'
import { useGlobalStore } from '~/stores/global'

defineProps<{
  show: boolean,
}>()

// eslint-disable-next-line
const emit = defineEmits<{
  (event: 'close'): void
  (event: 'list-item-check', listItem: TListItemModel): void
  (event: 'list-item-uncheck', listItem: TListItemModel): void
}>()

const note = unref(NotesService.currentNote as unknown as TNoteModel)
const globalStore = useGlobalStore()
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
      font-size: 24px;
      line-height: 28px;
    }

    &:not(:last-child) {
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
  }
}

.is-watch {
  background-color: black;
  color: rgba(255, 255, 255, 0.7);

  .watch-buttons {
    width: 100%;
    min-height: 84px;
    position: relative;
    display: flex;
    justify-content: center;
    overflow: hidden;

    &.watch-buttons--top {
      margin-bottom: 28px;

      &:before {
        bottom: 0;
      }
    }

    &.watch-buttons--bottom {
      margin-top: 28px;

      &:before {
        top: 0;
      }
    }

    &:before {
      content: '';
      width: 100%;
      height: 250px;
      position: absolute;
      bottom: 0;
      border-radius: 50%;
      background-color: #ffd800;
    }

    &:after {
      content: '';
      position: absolute;
      width: 4px;
      height: 100%;
      background-color: #000;
      left: 50%;
    }

    .q-icon {
      padding: 0 16px 6px 16px;
    }
  }

  .fullscreen__card-section {
    border-radius: 50%;
    padding-bottom: 0px !important;
    overflow: initial;

    .list-item {
      border-bottom: 2px solid rgba(255, 216, 0, 0.4);
      color: #ffd800;

      &.list-item--checked {
        color: #818181;
      }

      .list-item__text {
        justify-content: center;
        text-transform: uppercase;
        text-align: center;
        line-height: 28px;
        font-size: 28px;
        padding: 8px 0;
      }
    }
  }
}
</style>
