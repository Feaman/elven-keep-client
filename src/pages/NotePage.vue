<template lang="pug">
div sadf
</template>

<script setup lang="ts">
import NotesService from '~/composables/services/notes'

const props = defineProps<{
  id: number,
}>()
const note = NotesService.fi
switch ($route.path) {
  case '/new/list':
    note = vew NoteModel({})
    note.addListItem()
    break
  case '/new/text':
    note = new NoteModel({ typeId: TypesService.findByName(TypeModel.TYPE_TEXT).id })
    break
  default:
    handleNote()
    break
}
function handleNote() {
  // Find note
  const noteId = $route.params.id
  const note = $store.state.notes.find((note: NoteModel) => note.id === Number(noteId))
  if (!note) {
    return BaseService.error({ statusCode: 404, message: `Note width id "${noteId}" not found` })
  }
  note = note
}
</script>

<style lang="scss">

</style>
