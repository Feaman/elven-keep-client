<template lang="pug">
.notes.fill-height
  notes-toolbar.fill-width
  transition-group.d-flex.flex-wrap.pr-4.pb-4.mt-14(
    name="horizontal-list-effect"
    tag="div"
  )
    .note.ml-4.mt-4.pa-1(
      v-for="note in filteredNotes"
      :key="note.id"
    )
      note-preview(
        @click.native="openNote(note)"
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
  @State(state => state.isInitInfoLoading) isInitInfoLoading!: boolean

  scrollTimeout: ReturnType<typeof setTimeout> | null = null

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

  mounted () {
    this.$el.addEventListener('scroll', this.setMainListScroll)
    this.$el.scrollTo({ top: this.$store.state.mainListScrollTop })
  }

  openNote (note:NoteModel) {
    this.$router.push({ name: 'notes-id', params: { id: String(note.id) } })
  }

  setMainListScroll () {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout)
    }
    this.scrollTimeout = setTimeout(() => {
      this.$store.commit('setMainListScrollTop', this.$el.scrollTop)
    }, 100)
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

@media (max-width: 700px)
  .notes
    .note
      min-width 148px
</style>
