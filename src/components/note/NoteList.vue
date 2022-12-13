<template lang="pug">
.note-list(
  :class="{ fullscreen }"
  ref="rootElement"
)
  .note-list__list(
    :class="{ 'pb-3': isMain }"
  )
    div(
      handle=".list-item__handle"
    )
      transition-group(
        name="vertical-list-effect"
      )
        div(
          v-for="(listItem, index) in list"
          :key="listItem.generatedId"
        )
          .list-item.q-flex.items-center(
            :class="listItemClasses(listItem, index)"
          )
            transition( name="scale-fade")
              input.list-item__checkbox.mr-1(
                v-if="fullscreen"
                @change="check($event, listItem)"
                :checked="listItem.checked"
                :class="{ 'ml-9': !listItem.text }"
                type="checkbox"
                color="secondary"
              )

            q-icon.text-grey-6(
              v-if="!fullscreen"
              :name="mdiDrag"
              size="sm"
            )

            transition(name="scale-fade")
              input.list-item__checkbox.complete-checkbox(
                v-if="!fullscreen"
                @change="complete($event, listItem)"
                :checked="listItem.completed"
                type="checkbox"
              )

            .list-item__text.q-flex.mx-1.ml-2
              textarea.full-width(
                @input="updateText(listItem)"
                @keydown.enter="selectFocusedVariant($event)"
                @focus.stop="handleFocus(listItem)"
                @blur="handleBlur(listItem)"
                :value="listItem.text"
                :id="generateTextareaRefName(listItem)"
              )

            transition( name="scale-fade")
              input.list-item__checkbox.mr-1(
                v-if="!fullscreen"
                @change="check($event, listItem)"
                :checked="listItem.checked"
                :class="{ 'ml-9': !listItem.text }"
                type="checkbox"
                color="secondary"
              )
            transition( name="slide-fade")
              q-btn.list-item__remove-button(
                v-if="!fullscreen"
                @click="emit('remove', listItem)"
                :icon="mdiClose"
                color="grey-5"
                flat
                round
              )

    .note-list__create-button.q-flex.items-center.cursor-text.mt-2(
      v-if="isMain && !fullscreen"
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
    q-card.note-list__menu.shadow-6.py-2(
      v-if="variantsShown"
      :style="{ top: `${variantsMenuY}px`, left:  `${variantsMenuX}px` }"
    )
      q-list.list-item__variants(
        ref="variantsElement"
        dense
      )
        q-item.list-item__variant(
          v-for="(variant, index) in variants.slice(0, 10)"
          :key="index"
          :class="{ 'list-item__focused': variant.focused }"
          clickable v-ripple
        )
          q-item-section
            .q-flex.items-center.full-width(
              @click="selectVariant(variantsListItem, variant)"
            )
              .limit-width.font-size-14(v-html="variant.highlightedText")
              .text-green.font-size-12.ml-2(v-if="variant.isExists") exists
              .text-red.font-size-12.ml-2(v-if="variant.duplicatesQuantity") •&nbsp; {{ variant.duplicatesQuantity }}
</template>

<script setup lang="ts">
import { mdiDrag, mdiClose, mdiPlus } from '@quasar/extras/mdi-v6'
import { ref, onUnmounted, computed, onMounted, nextTick } from 'vue'
import { type TVariant, type TListItemModel } from '~/composables/models/list-item'
import { type TNoteModel } from '~/composables/models/note'
import NotesService from '~/composables/services/notes'

const props = defineProps<{
  fullscreen: boolean,
  isMain: boolean,
  note: TNoteModel,
  list: TListItemModel[],
}>()

// eslint-disable-next-line
const emit = defineEmits<{
  (event: 'add'): void
  (event: 'focus', listItem: TListItemModel): void
  (event: 'blur', listItem: TListItemModel): void
  (event: 'update-text', value: { listItem: TListItemModel, text: string }): void
  (event: 'update-order', value: { listItem: TListItemModel, order: number }): void
  (event: 'save', listItem: TListItemModel): void
  (event: 'check', listItem: TListItemModel): void
  (event: 'uncheck', listItem: TListItemModel): void
  (event: 'complete', listItem: TListItemModel): void
  (event: 'activate', listItem: TListItemModel): void
  (event: 'remove', listItem: TListItemModel): void
  (event: 'select-variant', value: { listItem: TListItemModel, variant: TVariant }): void
}>()

let saveTimeout: ReturnType<typeof setTimeout> | null = null
const rootElement = ref<HTMLElement | null>(null)
let $root: HTMLElement | null
const variants = ref<TVariant[]>([])
const variantsMenuX = ref(0)
const variantsShown = ref(false)
const variantsMenuY = ref(0)
const variantsListItem = ref<TListItemModel | null>(null)

function generateTextareaRefName(listItem: TListItemModel) {
  return `textarea-${listItem.generatedId}`
}

function getListItemTextarea(listItem: TListItemModel) {
  return $root?.querySelector(`textarea[id="${generateTextareaRefName(listItem)}"]`) as HTMLTextAreaElement
}

function assignTextAreas() {
  props.list.forEach((listItem) => listItem.$textarea = getListItemTextarea(listItem))
}

const order = computed({
  get() {
    return props.list.map((listItem) => listItem.id || 0)
  },
  set(order) {
    order.forEach((listItemId, index) => {
      const listItem = props.list.find((listItem) => listItem.id === listItemId)
      if (!listItem) {
        throw new Error(`List item ${listItemId} not found`)
      }
      emit('update-order', { listItem, order: index + 1 })
    })
    if (props.note.id) {
      NotesService.setOrder(props.note, order)
    }
  },
})

function handleFocus(listItem: TListItemModel) {
  emit('focus', listItem)
}

function listItemClasses(listItem: TListItemModel, index: number) {
  return {
    'list-item--first': index === 0,
    'list-item--focused': listItem.focused,
    'list-item--checked': listItem.checked,
    'list-item--completed': listItem.completed,
    'py-1': !props.fullscreen,
    'py-2': props.fullscreen,
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

//   @Watch('list')
//   onListChanged () {
//     this.$nextTick(() => {
//       ListItemsService.handleTextAreaHeights(this.list, this.$refs as { [key: string]: HTMLTextAreaElement [] })
//     })
//   }
function hideVariants() {
  variantsShown.value = false
}

async function init() {
  $root = rootElement.value
  if (props.isMain && props.list.length === 1 && !props.list[0].text) {
    await nextTick()
    props.list[0].$textarea.focus()
  }
  $root?.addEventListener('mousedown', hideVariants)

  // BaseService.events.$on('keydown', handleKeyDown)
  // $el.querySelectorAll('.list-item textarea').forEach($textarea => {
  // handleTextareaKeydown($textarea as HTMLTextAreaElement)
  // })

  // setTimeout(() => {
  // ListItemsService.handleTextAreaHeights(list, $refs as { [key: string]: HTMLTextAreaElement[] })
  // })
  assignTextAreas()
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  $root?.removeEventListener('mousedown', hideVariants)
})

//   beforeDestroy () {
//     BaseService.events.$off('keydown', this.handleKeyDown)
//   }

//   showVariants (event: MouseEvent) {
//     event.preventDefault()
//     this.variantsMenuX = event.clientX
//     this.variantsMenuY = event.clientY
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

function handleMenuInput(isMenuOpened: boolean) {
  if (!isMenuOpened) {
    variants.value = []
  }
}

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
  emit('add')
  await nextTick()
  const listItem = props.list[props.list.length - 1]
  const $textarea = getListItemTextarea(listItem)
  listItem.$textarea = $textarea
  // handleTextareaKeydown($textarea)
  $textarea.focus()
}

function check(event: Event, listItem: TListItemModel) {
  if ((event.target as HTMLInputElement).checked) {
    emit('check', listItem)
  } else {
    emit('uncheck', listItem)
  }
}

function complete(event: Event, listItem: TListItemModel) {
  if ((event.target as HTMLInputElement).checked) {
    emit('complete', listItem)
  } else {
    emit('activate', listItem)
  }
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

async function updateText(listItem: TListItemModel) {
  const text = listItem.$textarea?.value
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  emit('update-text', { listItem, text })
  variants.value = NotesService.findListItemVariants(listItem, text)
  if (variants.value.length) {
    variantsListItem.value = listItem
    const boundingBox = listItem.$textarea.getBoundingClientRect()
    const menuHeight = variants.value.length * 32 + 16
    const y = boundingBox.y + (boundingBox.y - 56 < menuHeight ? 32 : -menuHeight)
    await nextTick()
    variantsMenuX.value = boundingBox.x
    variantsMenuY.value = y
    variantsShown.value = true
  }
  saveTimeout = setTimeout(() => {
    emit('save', listItem)
    saveTimeout = null
  }, 400)
}

function selectVariant(listItem: TListItemModel | null, variant: TVariant) {
  if (listItem) {
    emit('select-variant', { listItem, variant })
    variants.value = []
  }
}

function handleBlur(listItem: TListItemModel) {
  emit('blur', listItem)
  const $textArea = getListItemTextarea(listItem)
  if ($textArea && $textArea.parentElement) {
    $textArea.parentElement.scrollTop = 0
  }
}
// }
</script>

<style lang="scss" scoped>
.note-list {
  &.fullscreen .list-item__text {
    font-size: 18px;
  }

  .note-list__list {
    position: relative;
    // .sortable-drag {
    //   opacity: 0 !important;
    // }

    // .sortable-ghost {
    //   background-color: #fff;
    //   box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    //   z-index: 20;
    // }

    .list-item {
      position: relative;
      border-top: 1px solid $grey-4;
      border-bottom: 1px solid transparent;
      transition: border-top 0.3s, border-bottom 0.3s;
      background-color: #fff;

      .list-item__checkbox {
        min-width: 20px;
        min-height: 20px;
        color: #f00;
        cursor: pointer;
      }

      .list-item__checkbox:not(:checked) {
        opacity: 0.3;
      }

      textarea {
        overflow: hidden;
      }

      .list-item__text {
        max-height: 60px;
        position: inherit;
        transition: height 0.3s;
        flex: 1;
        position: relative;
        overflow: hidden;
      }

      .list-item__text.list-item__text--multi-line:after {
        content: '...';
        width: 100%;
        height: 20px;
        line-height: 18px;
        position: absolute;
        top: 38px;
        background: #fff;
        cursor: text;
      }

      .list-item__text textarea {
        height: 24px;
        border: none;
        color: rgba(0, 0, 0, 0.87);
        line-height: 24px;
        outline: none;
        resize: none;
        transition: color 0.2s;
      }

      &.list-item--first {
        border-top: 1px solid transparent;
      }

      &.list-item--checked .list-item__text textarea {
        color: $grey-4;
        text-decoration: line-through;
        transition: color 0.2s;
      }

      &.list-item--focused {
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        z-index: 10;
      }

      &.list-item--focused .list-item__text {
        max-height: 178px;
        overflow: auto;
      }

      &.list-item--focused .list-item__text:after {
        display: none;
      }

      .list-item__handle {
        min-width: 28px;
        min-height: 24px;
        position: relative;
        z-index: 20;
        margin-left: -8px;
        cursor: pointer;
      }

      .list-item__remove-button {
        min-width: 24px;
        min-height: 24px;
      }
    }

  }

  .note-list__create-button {
    height: 24px;
    margin-left: 24px;

    &.note-list__create-button--alone {
      margin-left: 0;
    }
  }

  .note-list__menu {
    position: absolute;
  }
}

// .hint-menu .v-list-item {
//   min-height: 32px;
// }

.note-list__menu {
  max-width: 800px;
  width: calc(100% - 80px);

  .list-item__variants .list-item__variant--focused {
    background-color: rgba(0, 0, 0, 0.1);
  }
}
</style>
