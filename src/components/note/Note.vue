<template lang="pug">
.note.q-flex.column.items-center.full-height
  .note__content.column.no-wrap.full-width.full-height.py-2.px-3

    FullScreenView(
      @close="emit('fullscreen', false)"
      @list-item-check="note.checkOrUncheckListItem($event, true)"
      @list-item-uncheck="note.checkOrUncheckListItem($event, false)"
      :note="note"
      :show="fullscreen"
    )

    template(v-if="!fullscreen")
      .q-flex.items-center
        q-input.note__title-field.mt-1.mb-2(
          v-model.trim ="note.title"
          placeholder="Title"
          debounce="400"
          dense
        )
        q-btn.note__complete-checked-button.text-black(
          v-if="note.type?.name === NOTE_TYPE_LIST"
          @click="note.completeAllChecked()"
          :disabled="!note.checkedListItems.length"
          :icon="mdiCheckAll"
          size="sm"
          color="primary"
          glossy
          round
        )
          ToolTip(
            anchor="center left"
            self="center right"
          ) Complete checked items
      q-input.note__text(
        v-if="note.type?.name === NOTE_TYPE_TEXT"
        v-model="note.text"
        type="textarea"
        placeholder="Text"
      )
      template(v-if="note.type?.name === NOTE_TYPE_LIST")
        NoteList(
          is-main
        )
        template(v-if="note.completedListItems.length")
          q-separator.my-2
          q-expansion-item(
            header-style="padding-right: 0; padding-left: 8px"
            v-model="note.isCompletedListExpanded"
          )
            template(v-slot:header)
              .completed-list-header.text-green.q-flex.items-center
                .text-weight-bold.font-size-16 {{ note.completedListItems.length }}
                .ml-2 completed
              q-space
            NoteList(
              v-if="note.isCompletedListExpanded"
            )

  q-dialog(
    v-if="note.userId"
    @close:model-value="emit('hide-authors')"
    @hide="emit('hide-authors')"
    :model-value="showAuthors"
    transition-show="flip-up"
    transition-hide="flip-down"
  )
    q-card.note__authors
      q-toolbar.q-flex.bg-primary.shadow-3
        q-toolbar-title.text-black Authors
        q-space
        q-btn(
          @click="emit('hide-authors')"
          :icon="mdiClose"
          color="black"
          flat
          round
          dense
        )
      q-card-section.px-1
        q-list
          q-item-label.font-size-16.py-0(header) Author
          q-item.py-0
            q-item-section
              q-item-label {{ note.user?.getFio() }}
              q-item-label(
                caption
              ) {{ note.user?.email  }}
          template(v-if="note.coAuthors.length")
            q-item-label.font-size-16.py-0.pt-4(header) Co-Authors
            TransitionGroup(
              name="vertical-list"
              tag="div"
              style="position: relative"
            )
              q-item.co-author.py-0(
                v-for="coAuthor in note.coAuthors"
                :key="coAuthor.id"
              )
                q-item-section
                  .q-flex.items-center
                    div
                      q-item-label {{ coAuthor.user.getFio() }}
                      q-item-label(
                        caption
                      ) {{ coAuthor.user.email  }}
                    q-space
                    q-btn(
                      @click="note.removeCoAuthor(coAuthor)"
                      :icon="mdiClose"
                      color="grey"
                      round
                      flat
                    )
        .q-flex.full-width.mt-4.px-4
          q-input.col(
            @clear="coAuthorError = ''"
            v-model="coAuthorEmail"
            :error-messages="coAuthorError"
            :error="!!coAuthorError"
            :error-message="coAuthorError"
            name="co-author"
            placeholder="Co-author email"
            clearable
            dense
          )
          q-btn.note__add-coauthor-button(
            @click="addCoAuthor()"
            :disabled="!coAuthorEmail"
            :icon="mdiPlus"
            flat
            round
          )
</template>

<script setup lang="ts">
import { mdiCheckAll, mdiClose, mdiPlus } from '@quasar/extras/mdi-v6'
import { AxiosError } from 'axios'
import { ref, unref } from 'vue'
import { type TListItemModel } from '~/composables/models/list-item'
import { type TNoteModel } from '~/composables/models/note'
import { TYPE_LIST, TYPE_TEXT } from '~/composables/models/type'
import NotesService from '~/composables/services/notes'

const NOTE_TYPE_LIST = TYPE_LIST
const NOTE_TYPE_TEXT = TYPE_TEXT

const coAuthorEmail = ref('')
const coAuthorError = ref('')
const note = unref(NotesService.currentNote as unknown as TNoteModel)

defineProps<{
  fullscreen: boolean
  showAuthors: boolean
}>()

// eslint-disable-next-line
const emit = defineEmits<{
  (event: 'fullscreen', value: boolean): void
  (event: 'hide-authors'): void
  (event: 'hide'): void
}>()

function updateListItemOrder(listItem: TListItemModel, order: number) {
  listItem.order = order
}

async function addCoAuthor() {
  try {
    const existedEmail = note.coAuthors.find((_coAuthor) => _coAuthor.user.email === coAuthorEmail.value)
    if (existedEmail) {
      coAuthorError.value = 'Co-author with such an email is already exists'
      return
    }
    if (coAuthorEmail.value === note.user?.email) {
      coAuthorError.value = 'This person is already an Author'
      return
    }
    await note.createCoAuthor(coAuthorEmail.value)
    coAuthorEmail.value = ''
    coAuthorError.value = ''
  } catch (error) {
    coAuthorError.value = (error as AxiosError)?.response?.data?.message || (error as Error).message
  }
}

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
// }
</script>

<style lang="scss" scoped>
.note {
  .note__content {
    max-width: 900px;
    overflow: auto;
    flex: 1;

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

    :deep(.q-item__section--side) {
      padding: 0;
    }

    :deep(.q-focus-helper) {
      display: none;
    }

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

.note__authors {
  max-width: 350px;
  width: 100%;

  .note__add-coauthor-button {
    width: 3em;
    height: 3em;

    &:disabled {
      opacity: 0.2 !important;
    }
  }
}

// .co-authors {
// max-height: 250px;
// overflow-x: hidden;
// overflow-y: auto;
// }
</style>
