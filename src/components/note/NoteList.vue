<template lang="pug">
.note-list(
  :class="{  'note-list--focused': note.isFocused, 'note-list--semi-focused': isSemiFocus }"
  ref="rootElement"
)
  .note-list__container(
    :class="{ 'pb-3': isMain }"
  )
    .note-list__list
      TransitionGroup(
        name="vertical-list"
        tag="div"
        style="position: relative"
      )
        .list-item__container(
          v-for="listItem in list"
          :key="listItem.generatedId"
          :class="{ 'list-item__container--focused': listItem.focused }"
        )
          .list-item.q-flex.items-center(
            :class="{ 'list-item--checked': listItem.checked, 'list-item--completed': listItem.completed }"
          )
            //- q-icon.text-grey-6(
            //-   :name="mdiDrag"
            //-   size="sm"
            //- )

            input.list-item__checkbox.complete-checkbox(
              @change="complete($event, listItem)"
              :checked="listItem.completed"
              type="checkbox"
            )

            .list-item__text.q-flex.items-center.column.mx-1.ml-2
              textarea.full-width.transition(
                @input="updateText(listItem, $event)"
                @keydown.enter="selectFocusedVariant($event)"
                @focus="handleFocus(listItem)"
                @blur="note.blurListItem(listItem)"
                :value="listItem.text"
                :id="listItem.generateTextareaRefName()"
              )

            input.list-item__checkbox.mr-1(
              v-if="globalStore.user?.showChecked"
              @change="check($event, listItem)"
              :checked="listItem.checked"
              :class="{ 'ml-9': !listItem.text }"
              type="checkbox"
              color="secondary"
            )
            q-btn.list-item__remove-button(
              @click="note.removeListItem(listItem)"
              :icon="mdiClose"
              color="grey-5"
              flat
              round
            )
      div(
        v-intersection="onIntersection"
      )

    .note-list__create-button.q-flex.items-center.cursor-text.mt-2(
      :class="{ 'note-list__create-button--alone': !list.length, 'note-list__create-button--disabled': !isAddButtonActive }"
      @click="add"
    )
      q-icon(
        color="grey"
        :name="mdiPlus"
        size="sm"
      )
      .text-grey.ml-2 Add item

  transition(
    appear
    enter-active-class="animated zoomIn"
    leave-active-class="animated zoomOut"
  )
    q-card.note-list__menu.shadow-6(
      v-if="variantsShown"
      :style="{ maxWidth: `${variantsMenuMaxWidth}px`,top: `${variantsMenuY}px`, left:  `${variantsMenuX}px` }"
      ref="variantsElement"
    )
      q-list.list-item__variants(
        dense
      )
        q-item.list-item__variant(
          v-for="(variant, index) in variants"
          :key="index"
          :class="{ 'list-item__focused': variant.focused }"
          clickable v-ripple
        )
          q-item-section
            .q-flex.items-center.full-width.py-1(
              @click="selectVariant(variantsListItem, variant)"
            )
              .limit-width.font-size-14(v-html="variant.highlightedText")
              q-space
              .text-green.font-size-12.ml-2(v-if="variant.isExists") exists
              .list-item__variant-info.text-red.font-size-12.ml-2(v-if="variant.duplicatesQuantity") •&nbsp; {{ variant.duplicatesQuantity }}
</template>

<script setup lang="ts">
import { mdiDrag, mdiClose, mdiPlus } from '@quasar/extras/mdi-v6'
import { ref, unref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { QCard } from 'quasar'
// import draggable from 'vuedraggable'
import { type TVariant, type TListItemModel } from '~/composables/models/list-item'
import { type TNoteModel } from '~/composables/models/note'
import NotesService from '~/composables/services/notes'
import ListItemsService from '~/composables/services/list-items'
import { useGlobalStore } from '~/stores/global'
import KeyboardEvents from '~/helpers/keyboard-events'

const props = defineProps<{
  isMain?: boolean,
}>()

const rootElement = ref<HTMLElement | null>(null)
let $root: HTMLElement | null
const variants = ref<TVariant[]>([])
const variantsMenuX = ref(0)
const variantsShown = ref(false)
const variantsMenuY = ref(0)
const variantsMenuMaxWidth = ref(0)
const variantsListItem = ref<TListItemModel | null>(null)
const note = unref(NotesService.currentNote as unknown as TNoteModel)
const globalStore = useGlobalStore()
const isSemiFocus = ref(false)
let focusTimeout: ReturnType<typeof setTimeout> | undefined
const listItemsToShow = ref(Math.round((window.innerHeight - 140) / ListItemsService.listItemMinHeight))
const isAddButtonActive = computed(() => props.isMain && !isHasNotSavedListItem.value)

async function onIntersection(entry: { isIntersecting: boolean }) {
  if (!props.isMain && entry.isIntersecting) {
    listItemsToShow.value += 100
    await nextTick()
    await nextTick()
    ListItemsService.handleTextAreaHeights($root as HTMLDivElement)
  }
}

const fullList = computed(() => (props.isMain ? note.mainListItems : note.completedListItems))
const list = computed(() => {
  if (!props.isMain && listItemsToShow.value < fullList.value.length) {
    return fullList.value.slice(0, listItemsToShow.value)
  }

  return fullList.value
})
const isHasNotSavedListItem = computed(() => list.value.find((listItem) => !listItem.id))
const variantsElement = ref<QCard | null>(null)

// const order = computed({
//   get() {
//     return list.value.map((listItem) => listItem.id || 0)
//   },
//   set(order) {
//     order.forEach((listItemId, index) => {
//       const listItem = list.value.find((listItem) => listItem.id === listItemId)
//       if (!listItem) {
//         throw new Error(`List item ${listItemId} not found`)
//       }
//       // emit('update-order', listItem, index + 1)
//     })
//     if (note.id) {
//       NotesService.setOrder(note, order)
//     }
//   },
// })

async function checkVariants(listItem: TListItemModel) {
  variants.value = NotesService.findListItemVariants(listItem)
  const $textarea = listItem.getTextarea()
  if (variants.value.length && $textarea) {
    variantsListItem.value = listItem
    const boundingBox = $textarea.getBoundingClientRect()
    const menuHeight = variants.value.length * ListItemsService.variantsListItemMinHeight
    const y = ListItemsService.calculateVariantsMenuYPosition(boundingBox.y, menuHeight)
    await nextTick()
    variantsMenuX.value = boundingBox.x
    variantsMenuY.value = y
    variantsMenuMaxWidth.value = (rootElement.value?.offsetWidth || 350) - 52
    variantsShown.value = true
  } else {
    variantsShown.value = false
  }
}

function handleSemiFocus() {
  isSemiFocus.value = false
  if (focusTimeout) {
    clearTimeout(focusTimeout)
  }
  focusTimeout = setTimeout(() => {
    isSemiFocus.value = true
  }, 2000)
}

function handleFocus(listItem: TListItemModel) {
  listItem.focused = true
  isSemiFocus.value = false
  handleSemiFocus()
  if (!listItem.checked && !listItem.completed) {
    checkVariants(listItem)
  }
}

function focusListItem(index: number) {
  const nextListItem = list.value[index]
  nextListItem.focused = true
  nextListItem.getTextarea().focus()
}

async function add() {
  if (isAddButtonActive.value) {
    const listItem = ListItemsService.createListItem()
    note.addListItem(listItem as unknown as TListItemModel)
    await nextTick()
    ListItemsService.addTextareaKeydownEvent(listItem.getTextarea(), focusNextItem)
    listItem.getTextarea().focus()
  }
}

function focusNextItem(event: KeyboardEvent) {
  variantsShown.value = false
  const focusedListItem = list.value.find((item) => item.focused)
  if (focusedListItem) {
    const focusedItemIndex = list.value.indexOf(focusedListItem)
    if (focusedItemIndex === list.value.length - 1) {
      add()
      // if (props.isMain && focusedListItem.text) {
      // add()
      // } else if (props.isMain && !focusedListItem.id) {
      //   const $textarea = $el.querySelector('.list .px-3:last-child .list-item textarea') as HTMLTextAreaElement
      //   if ($textarea && $textarea.value) {
      //     setTimeout(() => {
      //       add()
      //     }, 400)
      //   } else if ($textarea && !$textarea.value) {
      //     focusListItem(0)
      //   }
      // } else {
      //   focusListItem(0)
      // }
    } else {
      focusListItem(focusedItemIndex + 1)
    }
  }
  event.preventDefault()
}

function hideVariants(event: Event) {
  if (!variantsElement.value?.$el.contains(event.target as Element)) {
    variantsShown.value = false
  }
}

function handleKeyDown(event: KeyboardEvent) {
  variantsShown.value = false
  switch (true) {
    case KeyboardEvents.is(event, KeyboardEvents.ARROW_UP):
      // this.focusVariant('up')
      break
    case KeyboardEvents.is(event, KeyboardEvents.ARROW_DOWN):
      // this.focusVariant('down')
      break
  }
}

async function init() {
  $root = rootElement.value

  document.addEventListener('mousedown', hideVariants)
  document.onkeydown = handleKeyDown

  if (props.isMain) {
    ListItemsService.handleTextAreaHeights($root as HTMLDivElement)
  } else {
    setTimeout(() => {
      ListItemsService.handleTextAreaHeights($root as HTMLDivElement)
    }, 100)
  }

  list.value.forEach((listitem) => ListItemsService.addTextareaSwipeEvent(note, listitem))

  $root?.querySelectorAll('.list-item textarea').forEach(($textarea) => {
    ListItemsService.addTextareaKeydownEvent($textarea as HTMLTextAreaElement, focusNextItem)
  })
}

onMounted(init)

onUnmounted(() => {
  document.removeEventListener('mousedown', hideVariants)
  document.onkeydown = null
})

//   beforeDestroy () {
//     BaseService.events.$off('keydown', this.handleKeyDown)
//   }

// function handleMenuInput(isMenuOpened: boolean) {
//   if (!isMenuOpened) {
//     variants.value = []
//   }
// }

//   focusVariant (direction: string) {
//     if (this.variants.length) {
//       const focusedVariant = this.variants.find(variant => variant.focused)
//       const variants = this.variants.map(variant => Object.assign({}, variant, { focused: false }))
//       let currentIndex = direction === 'down' ? 0 : variants.length - 1
//       if (focusedVariant) {
//         const adding = (direction === 'down' ? 1 : -1)
//         const currentVariantIndex = this.variants.indexOf(focusedVariant)
//         currentIndex = currentVariantIndex + adding
//         if (currentIndex < 0) {
//           currentIndex = variants.length - 1
//         } else if (currentIndex > this.variants.length - 1) {
//           currentIndex = 0
//         }
//       }
//       variants[currentIndex].focused = true
//       this.variants = variants
//     }
//   }

function selectFocusedVariant(event: Event) {
  console.log(event)
  // if (this.variants.length) {
  //   const focusedListItem = this.list.find((item) => item.focused)
  //   if (!focusedListItem) {
  //     throw new Error('Focused list item not found')
  //   }
  //   const focusedVariant = this.variants.find((variant) => variant.focused)
  //   if (focusedVariant) {
  //     this.selectVariant(focusedListItem, focusedVariant)
  //     event.preventDefault()
  //   }
  // }
}

function check(event: Event, listItem: TListItemModel) {
  note.checkOrUncheckListItem(listItem, (event.target as HTMLInputElement).checked)
}

function complete(event: Event, listItem: TListItemModel) {
  note.completeListItem(listItem, (event.target as HTMLInputElement).checked)
}

async function updateText(listItem: TListItemModel, event: Event) {
  const $textarea = event.target as HTMLTextAreaElement
  ListItemsService.handleListItemTextAreaHeight($textarea)
  if (listItem.saveTimeout) {
    clearTimeout(listItem.saveTimeout)
  }
  listItem.text = ($textarea as unknown as HTMLTextAreaElement).value
  listItem.saveTimeout = setTimeout(() => {
    note.saveListItem(listItem)
    listItem.saveTimeout = undefined
  }, 400)
  handleSemiFocus()
  if (!listItem.checked && !listItem.completed) {
    await checkVariants(listItem)
  }
}

async function selectVariant(listItem: TListItemModel | null, variant: TVariant) {
  if (listItem) {
    const resultListItem = note.selectVariant(listItem, variant)
    variants.value = []
    await nextTick()
    ListItemsService.handleListItemTextAreaHeight(resultListItem.getTextarea())
  }
}
</script>

<style lang="scss" scoped>
.note-list {
  &.note-list--focused {
    .list-item {
      opacity: 0.5;
    }
  }

  &.note-list--semi-focused {
    .list-item {
      opacity: 1;
    }
  }

  .note-list__list {
    // .sortable-drag {
    //   opacity: 0 !important;
    // }

    // .sortable-ghost {
    //   background-color: #fff;
    //   box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    //   z-index: 20;
    // }

    .list-item__container {
      width: 100%;

      &:not(:last-child) {
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      }

      &.list-item__container--focused {
        .list-item {
          opacity: 1;

          div.list-item__text {
            max-height: 178px;
            overflow: auto;

            &:after {
              display: none;
            }
          }
        }
      }

      .list-item {
        background-color: #fff;
        transition: opacity 0.5s;

        &.list-item--checked {

          .list-item__text {

            &:after {
              color: $grey-4;
            }

            textarea {
              color: $grey-4;
              text-decoration: line-through;
              transition: color 0.2s;
            }
          }
        }

        .list-item__checkbox {
          min-width: 20px;
          min-height: 20px;
          color: #f00;
          cursor: pointer;

          &:not(:checked) {
            opacity: 0.3;
          }
        }

        .list-item__text {
          max-height: 64px;
          position: inherit;
          flex: 1;
          position: relative;
          overflow: hidden;
          transition: max-height 0.2s;

          &.list-item__text--multi-line:after {
            content: '...';
            width: 100%;
            height: 18px;
            line-height: 10px;
            position: absolute;
            top: 46px;
            left: 0;
            background: #fff;
            cursor: text;
          }

          textarea {
            height: 36px;
            border: none;
            color: rgba(0, 0, 0, 0.87);
            line-height: 20px;
            padding: 8px 0;
            outline: none;
            resize: none;
            overflow: hidden;

            &.transition {
              transition: height 0.1s;
            }
          }
        }

        .list-item__remove-button {
          min-width: 24px;
          min-height: 24px;
        }
      }
    }
  }

  .note-list__create-button {
    height: 24px;
    margin-left: 23px;
    transition: opacity 0.3s;

    &.note-list__create-button--alone {
      margin-left: 0;
    }

    &.note-list__create-button--disabled {
      opacity: 0;
    }
  }

  .note-list__menu {
    position: absolute;
    z-index: 30;
  }
}

// .hint-menu .v-list-item {
//   min-height: 32px;
// }

.note-list__menu {
  .list-item__variants {
    .list-item__variant-info {
      min-width: 24px;
    }

    .list-item__variant:not(:last-child) {
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .list-item__variant--focused {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
