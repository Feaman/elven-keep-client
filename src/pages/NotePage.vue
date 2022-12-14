<template lang="pug">
.note-page.full-height
  NoteToolbar(
    @fullscreen="fullscreen = $event"
    :note="note"
  ).full-width
  Note(
    @update="updateNote"
    @list-item-focus="$event.focused = true"
    @list-item-blur="blurListItem"
    @list-item-update-text="updateListItemText"
    @list-item-update-order="updateListItemOrder"
    @list-item-save="saveListItem"
    @list-item-check="checkListItem"
    @list-item-uncheck="uncheckListItem"
    @list-item-complete="completeListItem"
    @list-item-activate="activateListItem"
    @list-item-remove="removeListItem"
    @list-item-add="addListItem"
    @select-variant="selectVariant"
    :note="note"
    :fullscreen="fullscreen"
  )
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { type TVariant, type TListItemModel } from '~/composables/models/list-item'
import noteModel, { type TNote, type TNoteModel } from '~/composables/models/note'
import { TYPE_LIST, TYPE_TEXT } from '~/composables/models/type'
import NotesService from '~/composables/services/notes'
import TypesService from '~/composables/services/types'

const noteIndex = ref(0)
const note = computed(() => NotesService.notes.value[noteIndex.value])
const route = useRoute()
const fullscreen = ref(false)

function updateNote(noteData: TNote) {
  Object.assign(note.value, noteData)
  note.value.save()
}

function selectVariant({ listItem, variant }: { listItem: TListItemModel, variant: TVariant }) {
  note.value.selectVariant(listItem, variant)
}

function checkListItem(listItem: TListItemModel) {
  listItem.checked = true
  note.value.saveListItem(listItem)
}

function uncheckListItem(listItem: TListItemModel) {
  listItem.checked = false
  note.value.saveListItem(listItem)
}

function completeListItem(listItem: TListItemModel) {
  note.value.completeListItem(true, listItem)
}

async function removeListItem(listItem: TListItemModel) {
  await note.value.removeListItem(listItem)
}

function activateListItem(listItem: TListItemModel) {
  note.value.completeListItem(false, listItem)
}

function saveListItem(listItem: TListItemModel) {
  note.value.saveListItem(listItem)
}

function updateListItemText({ listItem, text }: { listItem: TListItemModel, text: string }) {
  listItem.text = text
}

function updateListItemOrder({ listItem, order }: { listItem: TListItemModel, order: number }) {
  listItem.order = order
}

function blurListItem(listItem: TListItemModel) {
  listItem.focused = false
  note.value.saveListItem(listItem)
}

function addListItem(listItem: TListItemModel) {
  note.value.addListItem(listItem)
}

function init() {
  if (route.path === '/new/list') {
    NotesService.notes.value.push(noteModel({ typeId: TypesService.findByName(TYPE_LIST).id }) as unknown as TNoteModel)
    noteIndex.value = NotesService.notes.value.length - 1
  } else if (route.path === '/new/text') {
    NotesService.notes.value.push(noteModel({ typeId: TypesService.findByName(TYPE_TEXT).id }) as unknown as TNoteModel)
    noteIndex.value = NotesService.notes.value.length - 1
  } else if (/^\/note\/\d+$/.test(route.path)) {
    const foundNote = NotesService.notes.value.find((note: TNoteModel) => note.id === Number(route.params.id))
    if (!foundNote) {
      throw new Error(`Note width id "${route.params.id}" not found`)
    }
    noteIndex.value = NotesService.notes.value.indexOf(foundNote)
  }
}

init()

watch(
  route,
  () => {
    init()
  },
)

onBeforeUnmount(() => {
  if (!note.value.id) {
    NotesService.notes.value = NotesService.notes.value.filter((_note) => _note.id !== note.value.id)
  }
})
</script>

<style lang="scss">

</style>
