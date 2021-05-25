<template lang="pug" >
.new-list-page.fill-height
  note(:note="note")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import ListItemModel from '~/models/list-item'
import NoteModel from '~/models/note'

@Component({
  transition: 'slide-fade',
})
export default class NewListPage extends Vue {
  note: NoteModel | null = null

  created () {
    this.note = new NoteModel({})
    this.note.addListItem(new ListItemModel({ note: this.note }))
  }
}
</script>
