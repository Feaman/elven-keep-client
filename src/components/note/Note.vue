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
        template(
          v-if="note.type?.name === NOTE_TYPE_LIST && note.list.length"
        )
          q-btn.note__complete-checked-button.text-black(
            @click="note.completeAllChecked()"
            :disabled="!note.checkedListItems.length"
            :icon="mdiCheckAll"
            flat
            round
          )
            ToolTip Complete checked items

          q-btn.ml-1.margin-right-minus-10(
            :icon="mdiDotsVertical"
            flat
            round
          )
            q-menu(
              auto-close
            )
              q-list.font-size-14(
                dense
              )
                q-item.pl-1(
                  clickable
                )
                  q-item-section
                    q-toggle(
                      v-model="note.isShowCheckedCheckboxes"
                      label="Show checked checkboxes"
                      color="blue"
                      v-close-popup
                    )
                q-item.pl-1(
                  clickable
                )
                  q-item-section
                    q-toggle(
                      v-model="note.isCountable"
                      label="Show counter action"
                      color="blue"
                      v-close-popup
                    )
      q-input.note__text(
        v-if="note.type?.name === NOTE_TYPE_TEXT"
        v-model="note.text"
        type="textarea"
        debounce="400"
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
            q-item-label.font-size-16.py-0.pt-4(header) Co-Author{{ note.coAuthors.length > 1 ? 's' : '' }}
            TransitionGroup(
              name="vertical-list"
              tag="div"
              style="position: relative"
            )
              q-item.co-author.py-0.pr-1(
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
        .q-flex.full-width.mt-4.pl-4.pr-1
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
import { mdiDotsVertical, mdiCheckAll, mdiClose, mdiPlus, mdiNumeric2BoxMultiple } from '@quasar/extras/mdi-v6'
import {
  ref, watch, nextTick,
} from 'vue'
import { TYPE_LIST, TYPE_TEXT } from '~/composables/models/type'
import NotesService from '~/composables/services/notes'
import { useGlobalStore } from '~/stores/global'
import ListItemsService from '~/composables/services/list-items'
import { type TNoteModel } from '~/composables/models/note'

const NOTE_TYPE_LIST = TYPE_LIST
const NOTE_TYPE_TEXT = TYPE_TEXT

const coAuthorEmail = ref('')
const coAuthorError = ref('')
const note = NotesService.currentNote as unknown as { value: TNoteModel }
const globalStore = useGlobalStore()
const test = globalStore.isWatchMode

defineProps<{
  fullscreen: boolean
  showAuthors: boolean
}>()

// eslint-disable-next-line
const emit = defineEmits<{
  (event: 'fullscreen', value: boolean): void
  (event: 'is-watch', value: boolean): void
  (event: 'hide-authors'): void
  (event: 'hide'): void
}>()

async function addCoAuthor() {
  try {
    const existedEmail = note.value.coAuthors.find((_coAuthor) => _coAuthor.user.email === coAuthorEmail.value)
    if (existedEmail) {
      coAuthorError.value = 'Co-author with such an email is already exists'
      return
    }
    if (coAuthorEmail.value === note.value.user?.email) {
      coAuthorError.value = 'This person is already an Author'
      return
    }
    await note.value.createCoAuthor(coAuthorEmail.value)
    coAuthorEmail.value = ''
    coAuthorError.value = ''
  } catch (error) {
    coAuthorError.value = (error as { response: { data: { message: string }}})?.response?.data?.message || (error as Error).message
  }
}

watch(() => note.value.isShowCheckedCheckboxes, async () => {
  await nextTick()
  if (note.value.isCompletedListExpanded) {
    note.value.activeListItems.forEach((listItem) => ListItemsService.handleListItemTextAreaHeight(listItem.getTextarea()))
  } else {
    note.value.mainListItems.forEach((listItem) => ListItemsService.handleListItemTextAreaHeight(listItem.getTextarea()))
  }
})
</script>

<style lang="scss" scoped>
.note {
  .note__content {
    max-width: 900px;
    overflow: auto;
    flex: 1;

    .margin-right-minus-10 {
      margin-right: -10px;
    }

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

      &[disabled] {
        opacity: 0.1 !important;
      }
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
  }
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
</style>
