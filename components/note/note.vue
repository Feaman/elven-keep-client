<template lang="pug">
  .note.d-flex.flex-column.align-center.fill-height
    v-toolbar.toolbar.fill-width(
      color="primary"
      dark
    )
      v-btn(
        @click="$router.back()"
        icon
        dark
      )
        v-icon mdi-arrow-left
      v-divider(vertical)
      v-tooltip(
        bottom
      )
        template(
          v-slot:activator="{ on, attrs }"
        )
          v-btn(
            @click="coAuthorsDialogShown = true"
            v-bind="attrs"
            v-on="on"
            icon
          )
            v-icon mdi-account-plus-outline
        span Co-authors
      v-divider(vertical)
      toolbar-tools
      v-divider(vertical)
      v-spacer
      saving(v-if="note.id")

    .content.d-flex.flex-column.fill-width.fill-height.pt-2.px-3
      v-text-field.title-field.mt-1.mb-2(
        @input="note.update({ title: $event })"
        :value="note.title"
        placeholder="Title"
        hide-details
        dense
      )
      v-textarea.text(
        v-if="note.type.name === NOTE_TYPE_TEXT"
        @input="note.update({ text: $event })"
        :value="note.text"
        height="100%"
        placeholder="Text"
        hide-details
        outlined
        auto-grow
      )
      template(v-if="note.type.name === NOTE_TYPE_LIST")
        note-list(
          :note="note"
          :list="mainListItems"
          :is-main="true"
        )
        template(v-if="completedListItems.length")
          v-divider(
            :class="{ 'my-2': isNewButtonShown, 'my-2 mt-6': !isNewButtonShown }"
            v-if="completedListItems.length"
          )
          v-expansion-panels.mt-2.mb-4(
            v-model="expandedListItems"
            multiple
          )
            v-expansion-panel
              v-expansion-panel-header
                template(v-slot:actions)
                  v-icon.icon $expand
                .completed-list-header.green--text.d-flex.align-center.ml-4
                  .font-weight-bold.font-size-16 {{ completedListItems.length }}
                  .ml-2 completed
              v-expansion-panel-content
                note-list(
                  :note="note"
                  :list="completedListItems"
                )
    .co-authors-list.fill-width.pa-4.pt-3(
      v-if="note.coAuthors.length"
    )
      .grey--text Co-authors
      .d-flex.mt-2
        v-avatar(
          v-for="(coAuthor, index) in note.coAuthors"
          @click="coAuthorsDialogShown = true"
          :key="coAuthor.id"
          :class="{ 'ml-2': index > 0 }"
          size="36"
          color="primary"
        )
          .white--text {{ coAuthor.getInitials() }}

    v-dialog(
      v-model="coAuthorsDialogShown"
      :max-width="500"
      transition="scale-fade"
    )
      v-card.pb-4
        v-toolbar(
          color="primary"
          dark
        )
          v-btn(
            @click="coAuthorsDialogShown = false"
            icon
            dark
          )
            v-icon mdi-close
          v-toolbar-title Co-authors
        v-list(
          subheader
        )
          .grey--text.px-4.mt-4 Author
          v-list-item
            v-list-item-content
              v-list-item-title {{ user.getFio() }}
              v-list-item-subtitle {{ user.email }}
        v-divider
        v-list(
          subheader
        )
          .grey--text.px-4.mt-4 Co-authors
          .d-flex.flex-column
            .co-authors
              transition-group(
                name="vertical-list-effect"
              )
                div(
                  v-for="coAuthor in note.coAuthors"
                  :key="coAuthor.id"
                )
                  v-list-item
                    v-list-item-content
                      v-list-item-title {{ coAuthor.getFio() }}
                      v-list-item-subtitle {{ coAuthor.email }}
                    v-list-item-icon
                      v-icon(
                        @click="note.removeCoAuthor(coAuthor)"
                      ) mdi-close
            v-list-item.pr-3
              .d-flex.fill-width
                v-text-field.pt-0(
                  v-model="coAuthorEmail"
                  name="co-author"
                  placeholder="Co-author email"
                  :error-messages="coAuthorErrors"
                )
                v-btn(
                  @click="addCoAuthor()"
                  icon
                )
                  v-icon mdi-plus
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'
import NoteModel from '~/models/note'
import TypeModel from '~/models/type'
import NotesService from '~/services/notes'

@Component
export default class NoteComponent extends Vue {
  @State user!: string
  @Prop(NoteModel) note!: NoteModel

  NOTE_TYPE_LIST = TypeModel.TYPE_LIST
  NOTE_TYPE_TEXT = TypeModel.TYPE_TEXT
  coAuthorsDialogShown = false
  coAuthorEmail = ''
  coAuthorErrors: string[] = []

  get isNewButtonShown () {
    return !this.mainListItems.find(item => !item.text)
  }

  get expandedListItems () {
    return this.note.isCompletedListExpanded ? [0] : []
  }

  set expandedListItems (expandedPanelsArray: number[]) {
    this.note.update({ isCompletedListExpanded: !!expandedPanelsArray.length })
  }

  get completedListItems () {
    return this.note.list.filter(listItem => listItem.completed)
  }

  get mainListItems () {
    return this.note.list
      .filter(listItem => !listItem.completed)
      .sort((previousItem, nextItem) => {
        if (previousItem.checked === nextItem.checked) {
          return 0
        }
        return previousItem.checked ? 1 : -1
      })
  }

  mounted () {
    const app = this
    document.onkeydown = function (event) {
      event = event || window.event
      if (event.key === "Escape" || event.key === "Esc") {
        app.$router.go(-1)
      }
    }
  }

  destroyed () {
    document.onkeydown = null
  }

  addCoAuthor () {
    NotesService.addCoAuthor(this.coAuthorEmail)
      .then(user => {
        this.coAuthorEmail = ''
        return this.$store.dispatch('addNoteCoAuthor', { note: this.note, coAuthor: user })
      })
      .catch(() => {
        this.coAuthorErrors.push('Wrong email')
      })
  }
}
</script>

<style lang="stylus" scoped>
@import '~assets/css/variables'

$active-row-color = #6A1B9A

.note
  .toolbar
    z-index 30

  .content
    max-width 900px
    overflow auto

    .v-expansion-panel-header
      min-height 32px

    .completed-list-header
      order 1

    .title-field
      max-height 32px

    .text
      ::v-deep
        .v-input__control, .v-input__slot
          height 100%

    .v-input
      ::v-deep input
        font-weight bold
        font-size 24px

      ::v-deep textarea
        height 100% !important
        overflow auto
        margin-top 0

      ::v-deep fieldset
        border none

      ::v-deep .v-input__slot
        padding 0 !important

        &:before
          border none

    .v-expansion-panel
      &:before
        box-shadow none

      ::v-deep .v-expansion-panel-content__wrap, .v-expansion-panel-header
        padding 0

  .co-authors-list
    box-shadow 0 0 5px rgba(0, 0, 0, 0.5)

.co-authors
  max-height 250px
  overflow auto
</style>
