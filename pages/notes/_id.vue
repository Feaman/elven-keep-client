<template lang="pug" >
.note-page.fill-height
  keep-alive
    note(
      v-if="note"
      :note="note"
    )
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import NoteModel from '~/models/note'
import TypeModel from '~/models/type'
import BaseService from '~/services/base'
import TypesService from '~/services/types'

@Component({
  transition: 'slide-fade',
})
export default class NotePage extends Vue {
  note: NoteModel | null = null

  created () {
    switch (this.$route.name) {
      case 'new-list':
        this.note = new NoteModel({})
        this.note.addListItem()
        break
      case 'new-text':
        this.note = new NoteModel({ typeId: TypesService.findByName(TypeModel.TYPE_TEXT).id })
        break
      default:
        this.handleNote()
        break
    }
  }

  handleNote () {
    // Find note
    const noteId = this.$route.params.id
    const note = this.$store.state.notes.find((note: NoteModel) => note.id === Number(noteId))
    if (!note) {
      return BaseService.error({ statusCode: 404, message: `Note width id "${noteId}" not found` })
    }

    this.note = note
  }
}
</script>
