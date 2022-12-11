<template lang="pug">
.note-page
  NoteToolbar(
    :note="note"
  ).full-width
  Note(
    @update="Object.assign(note, $event)"
    :note="note"
  )
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import noteModel, { type TNoteModel } from '~/composables/models/note'
import { TYPE_TEXT } from '~/composables/models/type'
import NotesService from '~/composables/services/notes'
import TypesService from '~/composables/services/types'

const route = useRoute()
let note: TNoteModel

const props = defineProps<{
  id: number,
}>()

function handleNote() {
  const foundNote = NotesService.notes.value.find((note: TNoteModel) => note.id === Number(props.id))
  if (!foundNote) {
    throw new Error(`Note width id "${props.id}" not found`)
  }
  note = foundNote
}

switch (route.path) {
  case '/new/list':
    note = noteModel({}) as unknown as TNoteModel
    break
  case '/new/text':
    note = noteModel({ typeId: TypesService.findByName(TYPE_TEXT).id }) as unknown as TNoteModel
    break
  default:
    handleNote()
    break
}
</script>

<style lang="scss">

</style>
