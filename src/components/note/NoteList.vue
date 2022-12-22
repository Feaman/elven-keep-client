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
            :class="listItemClasses(listItem)"
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

            .list-item__text.q-flex.items-center.column.mx-1.ml-2.py-1
              textarea.full-width.transition.pa-0(
                @input="updateText(listItem, $event)"
                @keydown.enter="selectFocusedVariant($event)"
                @focus="handleFocus(listItem)"
                @blur="handleBlur(listItem)"
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
      v-if="isMain"
      :class="{ 'note-list__create-button--alone': !list.length }"
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
const listItemsToShow = ref(Math.round((window.innerHeight - 140) / 30))

function onIntersection(entry: { isIntersecting: boolean }) {
  if (!props.isMain && entry.isIntersecting) {
    listItemsToShow.value += 50
  }
}

const fullList = computed(() => (props.isMain ? note.mainListItems : note.completedListItems))
const list = computed(() => {
  if (!props.isMain && listItemsToShow.value < fullList.value.length) {
    return fullList.value.slice(0, listItemsToShow.value)
  }

  return fullList.value
})
const variantsElement = ref<QCard | null>(null)

const order = computed({
  get() {
    return list.value.map((listItem) => listItem.id || 0)
  },
  set(order) {
    order.forEach((listItemId, index) => {
      const listItem = list.value.find((listItem) => listItem.id === listItemId)
      if (!listItem) {
        throw new Error(`List item ${listItemId} not found`)
      }
      // emit('update-order', listItem, index + 1)
    })
    if (note.id) {
      NotesService.setOrder(note, order)
    }
  },
})

function calculateVariantsMenuYPosition(yPosition: number, menuHeight: number) {
  if (yPosition - 50 > menuHeight) {
    return yPosition - menuHeight
  }
  return 58
}

async function checkVariants(listItem: TListItemModel) {
  variants.value = NotesService.findListItemVariants(listItem)
  const $textarea = listItem.getTextarea()
  if (variants.value.length && $textarea) {
    variantsListItem.value = listItem
    const boundingBox = $textarea.getBoundingClientRect()
    const menuHeight = variants.value.length * 34
    const y = calculateVariantsMenuYPosition(boundingBox.y, menuHeight)
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

function listItemClasses(listItem: TListItemModel) {
  return {
    'list-item--checked': listItem.checked,
    'list-item--completed': listItem.completed,
  }
}

// function handleTextareaKeydown($textarea: HTMLTextAreaElement) {
//   $textarea.onkeydown = (event: KeyboardEvent) => {
//     if (KeyboardEvents.is(event, KeyboardEvents.ENTER, false, true)) {
//       this.focusNextItem(event)
//     }
//     if (KeyboardEvents.is(event, KeyboardEvents.ENTER, false, false, true)) {
//       this.focusNextItem(event)
//     }
//   }
// }

function hideVariants(event: Event) {
  if (!variantsElement.value?.$el.contains(event.target as Element)) {
    variantsShown.value = false
  }
}

async function init() {
  $root = rootElement.value

  document.addEventListener('mousedown', hideVariants)

  // BaseService.events.$on('keydown', handleKeyDown)
  // $el.querySelectorAll('.list-item textarea').forEach($textarea => {
  // handleTextareaKeydown($textarea as HTMLTextAreaElement)
  // })

  ListItemsService.handleTextAreaHeights($root as HTMLDivElement)
}

onMounted(init)

onUnmounted(() => document.removeEventListener('mousedown', hideVariants))

//   beforeDestroy () {
//     BaseService.events.$off('keydown', this.handleKeyDown)
//   }

// focusNextItem (event: KeyboardEvent) {
//   const focusedListItem = this.list.find(item => item.focused)
//   if (focusedListItem) {
//     const focusedItemIndex = this.list.indexOf(focusedListItem)
//     if (focusedItemIndex === this.list.length - 1) {
//       if (this.isMain && focusedListItem.text) {
//         this.addNewListItem()
//       } else if (this.isMain && !focusedListItem.id) {
//         const $textarea = this.$el.querySelector('.list .px-3:last-child .list-item textarea') as HTMLTextAreaElement
//         if ($textarea && $textarea.value) {
//           setTimeout(() => {
//             this.addNewListItem()
//           }, 400)
//         } else if ($textarea && !$textarea.value) {
//           this.focusListItem(0)
//         }
//       } else {
//         this.focusListItem(0)
//       }
//     } else {
//       this.focusListItem(focusedItemIndex + 1)
//     }
//   }
//   event.preventDefault()
// }

//   focusListItem (index: number) {
//     const nextListItem = this.list[index]
//     nextListItem.updateState({ focused: true })
//     setTimeout(() => {
//       const $textarea = ListItemsService.getListItemTextarea(this.list, nextListItem, this.$refs as { [key: string]: HTMLTextAreaElement[] })
//       if ($textarea) {
//         $textarea.focus()
//       }
//     })
//   }

// function handleMenuInput(isMenuOpened: boolean) {
//   if (!isMenuOpened) {
//     variants.value = []
//   }
// }

//   handleKeyDown (event: KeyboardEvent) {
//     switch (true) {
//       case KeyboardEvents.is(event, KeyboardEvents.ARROW_UP):
//         this.focusVariant('up')
//         break
//       case KeyboardEvents.is(event, KeyboardEvents.ARROW_DOWN):
//         this.focusVariant('down')
//         break
//     }
//   }

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

async function add() {
  const listItem = ListItemsService.createListItem()
  note.addListItem(listItem as unknown as TListItemModel)
  await nextTick()
  // handleTextareaKeydown($textarea)
  listItem.getTextarea().focus()
}

function check(event: Event, listItem: TListItemModel) {
  note.checkOrUncheckListItem(listItem, (event.target as HTMLInputElement).checked)
}

function complete(event: Event, listItem: TListItemModel) {
  note.completeListItem(listItem, (event.target as HTMLInputElement).checked)
}

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

async function updateText(listItem: TListItemModel, event: Event) {
  const $textarea = event.target as HTMLTextAreaElement
  if (!$textarea) {
    throw new Error('Textarea of the list item has not been found')
  }
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

function handleBlur(listItem: TListItemModel) {
  note.blurListItem(listItem)
  const $textArea = listItem.getTextarea()
  ListItemsService.handleListItemTextAreaHeight($textArea)
  if ($textArea && $textArea.parentElement) {
    $textArea.parentElement.scrollTop = 0
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

        &.list-item--checked .list-item__text textarea {
          color: $grey-4;
          text-decoration: line-through;
          transition: color 0.2s;
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
            height: 20px;
            line-height: 12px;
            position: absolute;
            top: 42px;
            left: 0;
            background: #fff;
            cursor: text;
          }

          textarea {
            height: 24px;
            border: none;
            color: rgba(0, 0, 0, 0.87);
            line-height: 20px;
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

    &.note-list__create-button--alone {
      margin-left: 0;
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
