<template lang="pug" >
.new-text-page.fill-height
  note(:note="note")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import NoteModel from '~/models/note'
import TypeModel from '~/models/type'
import TypeService from '~/services/type'

@Component({
  transition: 'slide-fade',
})
export default class NewListPage extends Vue {
  note: NoteModel | null = null

  created () {
    this.note = new NoteModel({ typeId: TypeService.findByName(TypeModel.TYPE_TEXT).id })
  }
}
</script>
