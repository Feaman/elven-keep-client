<template lang="pug">
.note-page
  NoteToolbar(
    :note="note"
  ).full-width
  div {{note.list.length}}
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import noteModel, { type NoteModel } from '~/composables/models/note'
import { TYPE_TEXT } from '~/composables/models/type'
import NotesService from '~/composables/services/notes'
import TypesService from '~/composables/services/types'

const route = useRoute()
let note: NoteModel

const props = defineProps<{
  id: number,
}>()

function handleNote() {
  const foundNote = NotesService.notes.value.find((note: NoteModel) => note.id === Number(props.id))
  if (!foundNote) {
    throw new Error(`Note width id "${props.id}" not found`)
  }
  note = foundNote
}

switch (route.path) {
  case '/new/list':
    note = noteModel({}) as unknown as NoteModel
    break
  case '/new/text':
    note = noteModel({ typeId: TypesService.findByName(TYPE_TEXT).id }) as unknown as NoteModel
    break
  default:
    handleNote()
    break
}
</script>

<style lang="scss">

</style>
