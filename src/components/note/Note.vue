<template lang="pug">
.note.q-flex.column.items-center.full-height
  .note__content.column.no-wrap.full-width.full-height.pt-2.px-3
    .q-flex.items-center
      q-input.note__title-field.mt-1.mb-2(
        @update:model-value="emit('update', { title: String($event) })"
        :model-value="note.title"
        placeholder="Title"
        dense
      )
      q-btn.note__complete-checked-button.text-black(
        v-if="note.type?.name === NOTE_TYPE_LIST"
        @click="completeChecked()"
        :disabled="!note.checkedListItems.length"
        :icon="mdiCheckAll"
        size="xs"
        color="primary"
        round
      )
        ToolTip Complete checked items
    q-input.note__text(
      v-if="note.type?.name === NOTE_TYPE_TEXT"
      @update:model-value="emit('update', {text: String($event)})"
      :model-value="note.text"
      type="textarea"
      placeholder="Text"
    )
    template(v-if="note.type?.name === NOTE_TYPE_LIST")
      note-list(
        @add="emit('list-item-add')"
        @focus="emit('list-item-focus', $event)"
        @blur="emit('list-item-blur', $event)"
        @update-text="emit('list-item-update-text', $event)"
        @update-order="emit('list-item-update-order', $event)"
        @save="emit('list-item-save', $event)"
        @check="emit('list-item-check', $event)"
        @uncheck="emit('list-item-uncheck', $event)"
        @complete="emit('list-item-complete', $event)"
        @activate="emit('list-item-activate', $event)"
        @remove="emit('list-item-remove', $event)"
        @select-variant="emit('select-variant', $event)"
        :fullscreen="fullscreen"
        :note="note"
        :list="note.mainListItems"
        :is-main="true"
        ref="noteList"
      )
  //-     template(v-if="completedListItems.length")
  //-       v-divider.my-2(
  //-         v-if="completedListItems.length"
  //-       )
  //-       v-expansion-panels.mt-2.mb-4(
  //-         v-model="expandedListItems"
  //-         multiple
  //-       )
  //-         v-expansion-panel
  //-           v-expansion-panel-header
  //-             template(v-slot:actions)
  //-               v-icon.icon $expand
  //-             .completed-list-header.green--text.d-flex.align-center
  //-               .font-weight-bold.font-size-16 {{ completedListItems.length }}
  //-               .ml-2 completed
  //-           v-expansion-panel-content
  //-             note-list(
  //-               :note="note"
  //-               :list="completedListItems"
  //-             )

  //- fullscreen(
  //-   v-if="isFullscreen"
  //-   @close="isFullscreen = false"
  //-   :note="note"
  //-   :show="isFullscreen"
  //- )

  //- v-dialog(
  //-   v-if="noteUser"
  //-   v-model="coAuthorsDialogShown"
  //-   :max-width="500"
  //-   transition="scale-fade"
  //-   @keydown.esc.stop=""
  //- )
  //-   v-card.pb-4
  //-     v-toolbar(
  //-       color="primary"
  //-     )
  //-       v-toolbar-title.pa-0 Authors
  //-       v-spacer
  //-       v-btn(
  //-         @click="coAuthorsDialogShown = false"
  //-         icon
  //-       )
  //-         v-icon mdi-close
  //-     v-list.pt-2(
  //-       subheader
  //-     )
  //-       .grey--text.px-4.mt-4 Author
  //-       v-list-item
  //-         v-list-item-content.pt-1
  //-           v-list-item-title {{ noteUser.getFio() }}
  //-           v-list-item-subtitle {{ noteUser.email }}
  //-       .d-flex.flex-column
  //-         v-list.pt-3(
  //-           subheader
  //-         )
  //-           .grey--text.px-4(
  //-             v-if="note.coAuthors.length"
  //-           ) Co-authors
  //-           .co-authors
  //-             transition-group(
  //-               name="vertical-list-effect"
  //-             )
  //-               .co-author(
  //-                 v-for="coAuthor in note.coAuthors"
  //-                 :key="coAuthor.id"
  //-               )
  //-                 v-list-item
  //-                   v-list-item-content.pt-1.pb-3
  //-                     v-list-item-title
  //-                       .d-flex.align-center
  //-                         div {{ coAuthor.user.getFio() }}
  //-                         .is-you.green--text.font-size-11.ml-2(
  //-                           v-if="coAuthor.user.id === user.id"
  //-                         ) you
  //-                     v-list-item-subtitle {{ coAuthor.user.email }}
  //-                   v-list-item-icon.mt-1(
  //-                     v-if="isMyNote || coAuthor.user.id === user.id"
  //-                   )
  //-                     v-icon(
  //-                       @click="removeCoAuthor(coAuthor)"
  //-                     ) mdi-close
  //-         v-list-item.pr-3(
  //-           v-if="isMyNote"
  //-         )
  //-           .d-flex.fill-width
  //-             v-text-field.pt-0(
  //-               v-model="coAuthorEmail"
  //-               :error-messages="coAuthorErrors"
  //-               name="co-author"
  //-               placeholder="Co-author email"
  //-             )
  //-             v-btn(
  //-               :disabled="!this.coAuthorEmail"
  //-               @click="addCoAuthor()"
  //-               icon
  //-             )
  //-               v-icon mdi-plus
</template>

<script setup lang="ts">
import { mdiCheckAll } from '@quasar/extras/mdi-v6'
import { type TVariant, type TListItemModel } from '~/composables/models/list-item'
import { type INote, type TNoteModel } from '~/composables/models/note'
import { TYPE_LIST, TYPE_TEXT } from '~/composables/models/type'

const NOTE_TYPE_LIST = TYPE_LIST
const NOTE_TYPE_TEXT = TYPE_TEXT

const props = defineProps<{
  note: TNoteModel
  fullscreen: boolean
}>()

// eslint-disable-next-line
const emit = defineEmits<{
  (event: 'update', value: INote): void
  (event: 'list-item-add'): void
  (event: 'list-item-remove', listItem: TListItemModel): void
  (event: 'list-item-focus', listItem: TListItemModel): void
  (event: 'list-item-blur', listItem: TListItemModel): void
  (event: 'list-item-check', listItem: TListItemModel): void
  (event: 'list-item-uncheck', listItem: TListItemModel): void
  (event: 'list-item-complete', listItem: TListItemModel): void
  (event: 'list-item-activate', listItem: TListItemModel): void
  (event: 'list-item-update-text', value: { listItem: TListItemModel, text: string }): void
  (event: 'list-item-update-order', value: { listItem: TListItemModel, order: string }): void
  (event: 'list-item-save', value: { listItem: TListItemModel, text: string }): void
  (event: 'select-variant', value: { listItem: TListItemModel, variant: TVariant }): void
}>()

// import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
// import { State } from 'vuex-class'
// import CoAuthorModel from '~/models/co-author'
// import NoteModel from '~/models/note'
// import TypeModel from '~/models/type'
// import UserModel from '~/models/user'
// import NotesService from '~/services/notes'
// import KeyboardEvents from '~/services/keyboard-events'
// import BaseService from '~/services/base'
// import ListItemsService from '~/services/list-items'
// @Component
// export default class NoteComponent extends Vue {
//   noteUser: UserModel | null = null
//   renderCompletedList = false
//   isFullscreen = false
//   @Prop(NoteModel) note!: NoteModel
//   @State user!: UserModel
//   @Watch('note', { deep: true })
//   onNoteChanged() {
//     if (this.note.user) {
//       this.noteUser = this.note.user
//     }
//   }
//   @Watch('coAuthorEmail')
//   onCoAuthorEmailChanged() {
//     if (this.coAuthorEmail === this.user.email) {
//       this.coAuthorErrors = ['It\'s a note author\'s email']
//     } else {
//       this.coAuthorErrors = []
//     }
//   }
//   NOTE_TYPE_LIST = TypeModel.TYPE_LIST
//   NOTE_TYPE_TEXT = TypeModel.TYPE_TEXT
//   coAuthorsDialogShown = false
//   coAuthorEmail = ''
//   coAuthorErrors: string[] = []
//   get isMyNote() {
//     return this.user.id === this.note.userId
//   }
//   get isNewButtonShown() {
//     return !this.mainListItems.find(item => !item.text)
//   }
//   get expandedListItems() {
//     return this.note.isCompletedListExpanded ? [0] : []
//   }
//   set expandedListItems(expandedPanelsArray: number[]) {
//     this.note.update({ isCompletedListExpanded: !!expandedPanelsArray.length })
//   }
//   get completedListItems() {
//     return ListItemsService.filterAndSort(this.note.list, true)
//   }
//   get mainListItems() {
//     return ListItemsService
//       .filterAndSort(this.note.list)
//   }
//   created() {
//     NotesService.events.$on('NOTE_REMOVED', this.handleNoteRemoved)
//     if (this.note.user) {
//       this.noteUser = this.note.user
//     }
//     this.$eventBus.$on('fullscreen', () => {
//       this.isFullscreen = true
//     })
//   }
//   handleNoteRemoved(note: NoteModel) {
//     if (note.id === this.note.id) {
//       this.$router.push('/')
//     }
//   }
//   mounted() {
//     BaseService.events.$on('keydown', this.handleKeyDown)
//   }
//   beforeDestroy() {
//     BaseService.events.$off('keydown', this.handleKeyDown)
//     NotesService.events.$off('NOTE_REMOVED', this.handleNoteRemoved)
//     if (this.note.checkIfClear()) {
//       this.note.remove(false)
//     }
//   }
function completeChecked() {
  props.note.completeAllChecked()
}
//   handleKeyDown(event: KeyboardEvent) {
//     switch (true) {
//       case KeyboardEvents.is(event, KeyboardEvents.BACKSPACE):
//         this.back()
//         break
//       case KeyboardEvents.is(event, KeyboardEvents.ESCAPE):
//         this.handleEscapeButton()
//         break
//     }
//   }
//   back() {
//     const focusedListItem = this.note.list.find(item => item.focused)
//     const activeElementTagName = document.activeElement?.tagName.toLowerCase()
//     if (!['input', 'textarea'].includes(activeElementTagName || '') && !this.coAuthorsDialogShown && !focusedListItem) {
//       this.$router.push('/')
//     }
//   }
//   handleEscapeButton() {
//     const focusedListItem = this.note.list.find(item => item.focused)
//     if (this.coAuthorsDialogShown) {
//       this.coAuthorsDialogShown = false
//     } else if (focusedListItem) {
//       focusedListItem.updateState({ focused: false })
//       const $noteList: HTMLElement = (this.$refs.noteList as Vue).$el as HTMLElement
//       if ($noteList) {
//         $noteList.querySelectorAll('textarea').forEach(($textarea: HTMLTextAreaElement) => $textarea.blur())
//       }
//     } else {
//       this.$router.go(-1)
//     }
//   }
//   addCoAuthor() {
//     if (!this.coAuthorErrors.length) {
//       NotesService.addCoAuthor(this.note, this.coAuthorEmail)
//         .then(() => this.coAuthorEmail = '')
//         .catch(error => this.coAuthorErrors = [(error?.response?.data?.message || 'Unexpected error')])
//     }
//   }
//   removeCoAuthor(coAuthor: CoAuthorModel) {
//     this.note.removeCoAuthor(coAuthor)
//       .then(() => {
//         if (this.note.userId !== this.user.id) {
//           this.$store.commit('removeNote', this.note)
//           this.$router.push('/')
//         }
//       })
//   }
// }
</script>

<style lang="scss" scoped>
// @import '~assets/css/variables'
// $active-row-color = #6A1B9A
.note {
  .note__content {
    max-width: 900px;
    overflow: auto;
    flex: 1;

    //     .v-expansion-panel-header {
    //       min-height: 32px;
    //     }

    .note__title-field {
      width: 100%;
      max-height: 32px;
      position: relative;

      &:after {
        content: '';
        width: 50px;
        height: 40px;
        position: absolute;
        top: 0;
        right: 0;
        background: linear-gradient(to left, #fff 20%, transparent);
      }

      :deep(input) {
        font-weight: bold;
        font-size: 24px;
      }

      :deep(*):before {
        border: none;
      }
    }

    .note__complete-checked-button {
      width: 24px;
      height: 24px;
    }

    .note__text {
      height: calc(100% - 45px) !important;

      &:deep(*) {
        height: 100% !important;
      }

      :deep(*):before {
        border: none;
      }

      &:deep(textarea) {
        overflow: auto;
        margin-top: 0 !important;
        resize: none;
        font-size: 16px;
        line-height: 26px;
        padding: 0;
      }
    }

    //     .v-expansion-panel:before {
    //       box-shadow: none;
    //     }

    //     .v-expansion-panel ::v-deep .v-expansion-panel-content__wrap,
    //     .v-expansion-panel .v-expansion-panel-header {
    //       padding: 0;
    //     }
    //   }

    //   .co-authors-list {
    //     box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    //     z-index: 20;
    //   }
  }

  // @media (max-width: 700px) {
  //   .note {
  //     .note .co-authors-list {
  //       height: 64px;
  //       padding: 4px 16px 16px 16px !important;
  //     }

  //     .co-authors-list .co-authors-list__title {
  //       font-size: 14px;
  //     }

  //     .co-authors-list .co-authors-list__avatars {
  //       margin-top: 4px !important;
  //     }

  //     .co-authors-list .co-authors-list__avatars .v-avatar {
  //       min-width: 24px !important;
  //       width: 24px !important;
  //       height: 24px !important;
  //     }
  //   }
}

// .co-authors {
// max-height: 250px;
// overflow-x: hidden;
// overflow-y: auto;
// }
</style>
