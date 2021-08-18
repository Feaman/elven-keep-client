<template lang="pug">
  .note.d-flex.flex-column.align-center.fill-height
    note-toolbar(
      :note="note"
      @co-authors-clicked="coAuthorsDialogShown = true"
    )
    .content.d-flex.flex-column.fill-width.fill-height.pt-2.px-3
      .d-flex.align-center
        v-text-field.title-field.mt-1.mb-2(
          @input="note.update({ title: $event })"
          :value="note.title"
          placeholder="Title"
          hide-details
          dense
        )
        v-tooltip(
          v-if="note.type.name === NOTE_TYPE_LIST"
          bottom
        )
          template(
            v-slot:activator="{ on, attrs }"
          )
            v-btn.complete-checked-button(
              @click="completeChecked()"
              :disabled="!checkedListItems.length"
              v-bind="attrs"
              v-on="on"
              color="primary"
              fab
              x-small
            )
              v-icon mdi-check
          span Complete checked items
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
          ref="noteList"
        )
        template(v-if="completedListItems.length")
          v-divider.my-2(
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
                .completed-list-header.green--text.d-flex.align-center
                  .font-weight-bold.font-size-16 {{ completedListItems.length }}
                  .ml-2 completed
              v-expansion-panel-content
                note-list(
                  :note="note"
                  :list="completedListItems"
                )

    v-dialog(
      v-if="noteUser"
      v-model="coAuthorsDialogShown"
      :max-width="500"
      transition="scale-fade"
      @keydown.esc.stop=""
    )
      v-card.pb-4
        v-toolbar(
          color="primary"
        )
          v-toolbar-title.pa-0 Authors
          v-spacer
          v-btn(
            @click="coAuthorsDialogShown = false"
            icon
          )
            v-icon mdi-close
        v-list.pt-2(
          subheader
        )
          .grey--text.px-4.mt-4 Author
          v-list-item
            v-list-item-content.pt-1
              v-list-item-title {{ noteUser.getFio() }}
              v-list-item-subtitle {{ noteUser.email }}
          .d-flex.flex-column
            v-list.pt-3(
              subheader
            )
              .grey--text.px-4(
                v-if="note.coAuthors.length"
              ) Co-authors
              .co-authors
                transition-group(
                  name="vertical-list-effect"
                )
                  .co-author(
                    v-for="coAuthor in note.coAuthors"
                    :key="coAuthor.id"
                  )
                    v-list-item
                      v-list-item-content.pt-1.pb-3
                        v-list-item-title
                          .d-flex.align-center
                            div {{ coAuthor.user.getFio() }}
                            .is-you.green--text.font-size-11.ml-2(
                              v-if="coAuthor.user.id === user.id"
                            ) you
                        v-list-item-subtitle {{ coAuthor.user.email }}
                      v-list-item-icon.mt-1(
                        v-if="isMyNote || coAuthor.user.id === user.id"
                      )
                        v-icon(
                          @click="removeCoAuthor(coAuthor)"
                        ) mdi-close
            v-list-item.pr-3(
              v-if="isMyNote"
            )
              .d-flex.fill-width
                v-text-field.pt-0(
                  v-model="coAuthorEmail"
                  :error-messages="coAuthorErrors"
                  name="co-author"
                  placeholder="Co-author email"
                )
                v-btn(
                  :disabled="!this.coAuthorEmail"
                  @click="addCoAuthor()"
                  icon
                )
                  v-icon mdi-plus
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'
import CoAuthorModel from '~/models/co-author'
import NoteModel from '~/models/note'
import TypeModel from '~/models/type'
import UserModel from '~/models/user'
import NotesService from '~/services/notes'
import KeyboardEvents from '~/services/keyboard-events'
import BaseService from '~/services/base'
import ListItemsService from '~/services/list-items'

@Component
export default class NoteComponent extends Vue {
  noteUser: UserModel | null = null
  renderCompletedList = false

  @Prop(NoteModel) note!: NoteModel

  @State user!: UserModel

  @Watch('note', { deep: true })
  onNoteChanged () {
    if (this.note.user) {
      this.noteUser = this.note.user
    }
  }

  @Watch('coAuthorEmail')
  onCoAuthorEmailChanged () {
    if (this.coAuthorEmail === this.user.email) {
      this.coAuthorErrors = ['It\'s a note author\'s email']
    } else {
      this.coAuthorErrors = []
    }
  }

  NOTE_TYPE_LIST = TypeModel.TYPE_LIST
  NOTE_TYPE_TEXT = TypeModel.TYPE_TEXT
  coAuthorsDialogShown = false
  coAuthorEmail = ''
  coAuthorErrors: string[] = []

  get isMyNote () {
    return this.user.id === this.note.userId
  }

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
    return ListItemsService.filterAndSort(this.note.list, true)
  }

  get mainListItems () {
    return ListItemsService
      .filterAndSort(this.note.list)
  }

  get checkedListItems () {
    return this.note.list.filter(listItem => listItem.checked && !listItem.completed)
  }

  created () {
    NotesService.events.$on('NOTE_REMOVED', this.handleNoteRemoved)
    if (this.note.user) {
      this.noteUser = this.note.user
    }
  }

  handleNoteRemoved (note: NoteModel) {
    if (note.id === this.note.id) {
      this.$router.push('/')
    }
  }

  mounted () {
    BaseService.events.$on('keydown', this.handleKeyDown)
  }

  beforeDestroy () {
    BaseService.events.$off('keydown', this.handleKeyDown)
    NotesService.events.$off('NOTE_REMOVED', this.handleNoteRemoved)
    if (this.note.checkIfClear()) {
      this.note.remove(false)
    }
  }

  completeChecked () {
    this.checkedListItems.forEach((listItem) => {
      listItem.complete(true)
    })
  }

  handleKeyDown (event: KeyboardEvent) {
    switch (true) {
      case KeyboardEvents.is(event, KeyboardEvents.BACKSPACE):
        this.back()
        break
      case KeyboardEvents.is(event, KeyboardEvents.ESCAPE):
        this.handleEscapeButton()
        break
    }
  }

  back () {
    const focusedListItem = this.note.list.find(item => item.focused)
    const activeElementTagName = document.activeElement?.tagName.toLowerCase()
    if (!['input', 'textarea'].includes(activeElementTagName || '') && !this.coAuthorsDialogShown && !focusedListItem) {
      this.$router.push('/')
    }
  }

  handleEscapeButton () {
    const focusedListItem = this.note.list.find(item => item.focused)
    if (this.coAuthorsDialogShown) {
      this.coAuthorsDialogShown = false
    } else if (focusedListItem) {
      focusedListItem.updateState({ focused: false })
      const $noteList: HTMLElement = (this.$refs.noteList as Vue).$el as HTMLElement
      if ($noteList) {
        $noteList.querySelectorAll('textarea').forEach(($textarea: HTMLTextAreaElement) => $textarea.blur())
      }
    } else {
      this.$router.go(-1)
    }
  }

  addCoAuthor () {
    if (!this.coAuthorErrors.length) {
      NotesService.addCoAuthor(this.note, this.coAuthorEmail)
        .then(() => this.coAuthorEmail = '')
        .catch(error => this.coAuthorErrors = [(error?.response?.data?.message || 'Unexpected error')])
    }
  }

  removeCoAuthor (coAuthor: CoAuthorModel) {
    this.note.removeCoAuthor(coAuthor)
      .then(() => {
        if (this.note.userId !== this.user.id) {
          this.$store.commit('removeNote', this.note)
          this.$router.push('/')
        }
      })
  }
}
</script>

<style lang="stylus" scoped>
@import '~assets/css/variables'

$active-row-color = #6A1B9A

.note
  .mt-14px
    margin-top 14px !important

  .content
    max-width 900px
    overflow auto

    .v-expansion-panel-header
      min-height 32px

    .title-field
      max-height 32px
      position relative

      &:after
        content ''
        width 50px
        height 100%
        position absolute
        top 0
        right 0
        background linear-gradient(to left, #fff 20%, transparent)

    .complete-checked-button
      width 24px
      height 24px

      &:not(.v-btn--disabled)
        box-shadow 0px 0px 5px 0 rgba(0, 0, 0, 0.2), 0px 0px 10px 0px rgba(0, 0, 0, 0.14), 0px 0px 16px 0px rgba(0, 0, 0, 0.14)

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
    z-index 20

@media (max-width: 700px)
  .note
    .co-authors-list
      height 64px
      padding 4px 16px 16px 16px !important

      .co-authors-list__title
        font-size 14px

      .co-authors-list__avatars
        margin-top 4px !important

        .v-avatar
          min-width 24px !important
          width 24px !important
          height 24px !important

.co-authors
  max-height 250px
  overflow-x hidden
  overflow-y auto
</style>
