<template lang="pug">
div asdf
</template>

<script setup lang="ts">
// import { useListItemsStore } from '~/stores/list-items'

const props = defineProps({
  note: {
    type: NoteModel,
    required: true,
  },
})

// const listItemsStore = useListItemsStore()
// const completedListItems = listItemsStore.filterCompleted(props.note)
</script>

<style lang="scss" scoped>
.note-preview {
  min-width: 250px;
  max-width: 300px;
  height: 260px;
  flex: 1;

  @media (max-width: 700px) {
    min-width: 148px;
    max-width: 330px;
  }
}
</style>
