<template lang="pug">
q-card.note-preview.cursor-pointer.full-height.q-pa-xs.q-pt-sm(
  :id="note.id"
  :class="{ 'with-completed': completedListItems.length, gradient: note.isGradient }"
  :ripple="false"
  tabindex="0"
)
  .title.limit-width(v-if="note.title") {{ note.title }}
  template(v-if="note.type.value?.name === NOTE_TYPE_LIST")
    .list(
      :class="{ 'mt-1': note.title }"
    )
      .list-item.row.align-center.mt-1(
        v-for="(listItem, i) in mainListItems"
        :key="i"
        :class="{ checked: listItem.checked }"
      )
        q-icon(color="grey lighten-1" name="checkbox-blank-outline")
        .list-item__text.limit-width.ml-2 {{ listItem.text }}

      .co-authors-container.d-flex.justify-end.fill-width
        .co-authors.d-flex.justify-end
          q-avatar(
            v-for="(coAuthor, index) in coAuthors"
            :key="coAuthor.id"
            :class="{ 'ml-2': index > 0 }"
            size="20"
            color="purple"
          )
            .white--text.font-size-10 {{ coAuthor.user.getInitials() }}

    .completed-list-header.d-flex.align-center.grey--text.fill-width.mt-2.pl-5(
      v-if="completedListItems.length"
    )
      .green--text.font-weight-bold {{ completedListItems.length }}
      .ml-1 completed

  .text.d-flex.flex-column(
    v-else
  )
    div {{ note.text }}
    .co-authors-container.d-flex.justify-end.fill-width
      .co-authors.d-flex.justify-end
        q-avatar(
          v-for="(coAuthor, index) in coAuthors"
          :key="coAuthor.id"
          :class="{ 'ml-2': index > 0 }"
          size="20"
          color="purple"
        )
          .white--text.font-size-10 {{ coAuthor.user.getInitials() }}

  q-btn.remove-button(
    v-if="note.isMyNote"
    @click.stop="$emit('remove')"
    icon="close"
  )
</template>

<script setup lang="ts">
import { ref } from 'vue'
import noteModel from '~/composables/models/note'
import { TYPE_LIST } from '~/composables/models/type'

const props = defineProps<{
  note: ReturnType<typeof noteModel>
}>()

const NOTE_TYPE_LIST = TYPE_LIST
const completedListItems = ref(props.note.completedListItems)
const mainListItems = ref(props.note.mainListItems)
const coAuthors = ref(props.note.coAuthors)
</script>

<style lang="scss" scoped>
.note-preview {
  position: relative;
  overflow: hidden;
  background: none;
  transform: scale(1);
  transition: transform 0.3s;
}

.note-preview:focus {
  outline: none;
  border-radius: 6px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  transform: scale(1.05);
}

.note-preview:before {
  background: none;
}

.note-preview.gradient:after {
  content: '';
  width: 100%;
  height: 90px;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 20;
  background: linear-gradient(to top, #fff 24px, transparent);
}

.note-preview.gradient.with-completed:after {
  background: linear-gradient(to top, #fff 48px, transparent);
}

.note-preview .co-authors-container {
  position: absolute;
  bottom: 16px;
}

.note-preview .co-authors {
  position: relative;
  overflow: hidden;
  z-index: 30;
}

.note-preview .co-authors:after {
  content: '';
  width: 100%;
  height: 20px;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 20;
  background: linear-gradient(to left, transparent, #fff 25px);
}

.note-preview .remove-button {
  position: absolute;
  right: 4px;
  top: 5px;
  background: radial-gradient(#fff 30%, transparent);
}

.note-preview .title {
  line-height: normal;
}

.note-preview .text {
  height: calc(100% - 16px);
  position: relative;
}

.note-preview .list {
  height: calc(100% - 24px);
  position: relative;
}

.note-preview .list .list-item.checked .list-item__text {
  text-decoration: line-through;
  color: blue;
}

.note-preview .completed-list-header {
  position: absolute;
  left: 0;
  bottom: 16px;
  z-index: 30;
}

.note-preview ::v-deep .mdi-checkbox-blank-outline:before,
.note-preview ::v-deep .mdi-checkbox-marked:before {
  font-size: 16px;
}

@media (max-width: 600px) {
  .note-preview {
    padding: 8px 10px 10px 10px;
  }
}

@media (max-width: 700px) {
  .co-authors {
    display: none !important;
  }
}
</style>
