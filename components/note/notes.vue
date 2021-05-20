<template lang="pug">
.notes.fill-height.pr-4.pb-4
    transition-group.d-flex.flex-wrap(
      name="horizontal-list-effect"
      tag="div"
    )
      .note.ml-4.mt-4.pa-1(
        v-for="note in filteredNotes"
        :key="note.id"
      )
        note-preview(
          @click.native="$router.push(`/notes/${note.id}`)"
          @remove="note.remove()"
          :note="note"
        )
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import NoteModel from '~/models/note'

@Component
export default class NotesComponent extends Vue {
  @State(state => state.notes) notes!: Array<NoteModel>
  @State(state => state.searchQuery) searchQuery!: string

  get filteredNotes () {
    if (!this.searchQuery) {
      return this.notes
    }
    return this.notes.filter((note: NoteModel) => {
      const regExp = new RegExp(this.searchQuery, 'i')
      let foundInLisListItems = false
      note.list.forEach(listItem => {
        if (regExp.test(listItem.text || '')) {
          foundInLisListItems = true
        }
      })
      return regExp.test(note.title || '') || regExp.test(note.text || '') || foundInLisListItems
    })
  }
}
</script>

<style lang="stylus" scoped>
.notes
  overflow auto

  .note
    min-width 250px
    max-width 300px
    height 260px
    flex 1
    overflow hidden

@media (max-width: 700px)
  .notes
    .note
      min-width 148px
</style>
