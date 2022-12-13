<template lang="pug">
.note-page.full-height
  NoteToolbar(
    @fullscreen="fullscreen = $event"
    :note="note"
  ).full-width
  Note(
    @update="Object.assign(note, $event)"
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { type TVariant, type TListItemModel } from '~/composables/models/list-item'
import noteModel, { type TNoteModel } from '~/composables/models/note'
import { TYPE_TEXT } from '~/composables/models/type'
import NotesService from '~/composables/services/notes'
import TypesService from '~/composables/services/types'

const route = useRoute()
const fullscreen = ref(false)
let note: TNoteModel

const props = defineProps<{
  id: number,
}>()

function handleNote() {
  const foundNote = NotesService.notes.value.find((note: TNoteModel) => note.id === Number(props.id))
  if (!foundNote) {
    throw new Error(`Note width id "${props.id}" not found`)
  }
  note = foundNote
}

function selectVariant({ listItem, variant }: { listItem: TListItemModel, variant: TVariant }) {
  note.selectVariant(listItem, variant)
}

function checkListItem(listItem: TListItemModel) {
  listItem.checked = true
  note.saveListItem(listItem)
}

function uncheckListItem(listItem: TListItemModel) {
  listItem.checked = false
  note.saveListItem(listItem)
}

function completeListItem(listItem: TListItemModel) {
  note.completeListItem(true, listItem)
}

async function removeListItem(listItem: TListItemModel) {
  await note.removeListItem(listItem)
}

function activateListItem(listItem: TListItemModel) {
  console.log('HEREJjkh')
}

function saveListItem(listItem: TListItemModel) {
  note.saveListItem(listItem)
}

function updateListItemText({ listItem, text }: { listItem: TListItemModel, text: string }) {
  listItem.text = text
}

function updateListItemOrder({ listItem, order }: { listItem: TListItemModel, order: number }) {
  listItem.order = order
}

function blurListItem(listItem: TListItemModel) {
  listItem.focused = false
  note.saveListItem(listItem)
}

function addListItem() {
  note.addListItem()
}

switch (route.path) {
  case '/new/list':
    note = noteModel({}) as unknown as TNoteModel
    break
  case '/new/text':
    note = noteModel({ typeId: TypesService.findByName(TYPE_TEXT).id }) as unknown as TNoteModel
    break
  default:
    handleNote()
    break
}
</script>

<style lang="scss">

</style>
