<template lang="pug">
.note-list(
  :class="{  'note-list--focused': note?.isFocused, 'note-list--semi-focused': isSemiFocus }"
  ref="rootElement"
)
  .note-list__container(
    :class="{ 'pb-3': isMain }"
  )
    .note-list__list
      draggable(
        v-model="list"
        :set-data="setDragGhostData"
        :component-data="{ name: drag ?  null : 'vertical-list' }"
        @start="drag = true"
        @end="drag = false"
        tag="transition-group"
        handle=".list-item__handle"
        ghost-class="sortable-ghost"
        item-key="generatedId"
      )
        template(
          #item="{element}"
        )
          .list-item__container(
            :class="{ 'list-item__container--focused': element.focused }"
          )
            .list-item.q-flex.items-center(
              :class="{ 'list-item--checked': element.checked, 'list-item--completed': element.completed }"
            )
              q-icon.list-item__handle.text-grey-6(
                :name="mdiDrag"
                size="sm"
              )

              input.list-item__checkbox.complete-checkbox(
                @change="complete($event, element)"
                :checked="element.completed"
                type="checkbox"
              )

              .list-item__text.q-flex.items-center.column.mx-1.ml-2
                textarea.full-width.transition(
                  @input="updateText(element, $event)"
                  @keydown.enter="selectFocusedVariant($event)"
                  @focus="handleFocus(element)"
                  @blur="note.blurListItem(element)"
                  :value="element.text"
                  :id="element.generateTextareaRefName()"
                )

              .list-item-counter__icon.px-2.cursor-pointer(
                v-if="note.isCountable"
                @click="showCounterDialog(element)"
                :class="`${note.isShowCheckedCheckboxes ? 'mr-14' : 'mr-7'}`"
              )
                q-icon(
                  :name="mdiNumeric2BoxMultiple"
                  color="purple"
                )

              input.list-item__checkbox.mr-1(
                v-if="note.isShowCheckedCheckboxes"
                @change="check($event, element)"
                :checked="element.checked"
                :class="{ 'ml-9': !element.text }"
                type="checkbox"
                color="secondary"
              )
              q-btn.list-item__remove-button(
                @click="note.removeListItem(element)"
                :icon="mdiClose"
                color="grey-5"
                flat
                round
              )

    .note-list__create-button.q-flex.items-center.cursor-text.mt-2(
      v-if="props.isMain"
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
      v-if="isVariantsShown"
      :style="{ maxWidth: `${variantsMenuMaxWidth}px`,top: `${variantsMenuY}px`, left:  `${variantsMenuX}px` }"
      ref="variantsElement"
    )
      q-list.list-item__variants(
        dense
      )
        q-item.list-item__variant(
          v-for="(variant, index) in variants"
          :key="index"
          :class="{ 'list-item__variant--focused': variant.focused }"
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

  q-dialog(
    @hide="hideCounterDialog"
    :model-value="isCounterDialogShown"
    :backdrop-filter="'blur(4px) brightness(60%)'"
    transition-show="jump-right"
    transition-hide="jump-left"
  )
    .list-item-counter__container.text-center.full-height.q-flex.column.no-wrap.justify-end.pa-5.mb-16(
      @click="isCounterDialogShown = false"
    )
      .text-white.text-uppercase.font-size-16 Click anywhere on the shadow to close the dialog
      .q-space
      .list-item-counter__list-item.pa-3.mt-8(
        v-html="counterListItem.getHighlightedCounterText()"
      )
      .d-flex.row.no-wrap.mt-10(
        @click.stop
      )
        .list-item-counter__measurements.mt-3.ml-1.text-uppercase
          .list-item-counter__measurement.bg-primary.px-3.text-center.cursor-pointer(
              @click="setCounterMeasurement(COUNTER_MEASUREMENT_PIECES)"
              :class="{ 'list-item-counter--current': counterListItem.counterMeasurement === COUNTER_MEASUREMENT_PIECES }"
            ) {{ COUNTER_MEASUREMENT_PIECES }}
          .list-item-counter__measurement.bg-primary.px-3.mt-3.text-center.cursor-pointer(
              @click="setCounterMeasurement(COUNTER_MEASUREMENT_PACKAGES)"
              :class="{ 'list-item-counter--current': counterListItem.counterMeasurement === COUNTER_MEASUREMENT_PACKAGES }"
            ) {{ COUNTER_MEASUREMENT_PACKAGES }}
        .list-item-counter__numbers.row.justify-end
          .list-item-counter__quantity.bg-primary.px-3.mt-3.ml-3.cursor-pointer(
            v-for="(quantity, index) in [1, 2, 3, 4, 5, 6, 7, 8]"
            :key="index"
            @click="setCounterQuantity(quantity)"
            :class="{ 'list-item-counter--current': counterListItem.counterQuantity === quantity }"
          ) {{ quantity }}
</template>

<script setup lang="ts">
import { mdiDrag, mdiClose, mdiPlus, mdiNumeric2BoxMultiple } from '@quasar/extras/mdi-v6'
import { ref, unref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { QCard } from 'quasar'
import draggable from 'zhyswan-vuedraggable'
import listItemModel, { type TVariant, type TListItemModel, COUNTER_MEASUREMENT_PACKAGES, COUNTER_MEASUREMENT_PIECES } from '~/composables/models/list-item'
import { type TNoteModel } from '~/composables/models/note'
import NotesService from '~/composables/services/notes'
import ListItemsService from '~/composables/services/list-items'
import { useGlobalStore } from '~/stores/global'
import KeyboardEvents from '~/helpers/keyboard-events'
import BaseService from '~/services/base'

const props = defineProps<{
  isMain?: boolean,
}>()

let $root: HTMLElement | null
let focusTimeout: ReturnType<typeof setTimeout> | undefined
const rootElement = ref<HTMLElement | null>(null)
const variants = ref<TVariant[]>([])
const variantsMenuX = ref(0)
const isVariantsShown = ref(false)
const variantsMenuY = ref(0)
const variantsMenuMaxWidth = ref(0)
const variantsListItem = ref<TListItemModel | null>(null)
const note = NotesService.currentNote as unknown as { value: TNoteModel }
const globalStore = useGlobalStore()
const isSemiFocus = ref(false)
const variantsElement = ref<QCard | null>(null)
const listItemsToShow = ref(Math.round((window.innerHeight - 140) / ListItemsService.listItemMinHeight))
const fullList = computed(() => (props.isMain ? note.value.mainListItems : note.value.completedListItems))
const counterListItem = ref<TListItemModel | undefined>(undefined)
const isCounterDialogShown = ref(false)
const drag = ref(false)
const list = computed({
  get() {
    if (!props.isMain && listItemsToShow.value < fullList.value.length) {
      return fullList.value.slice(0, listItemsToShow.value)
    }

    return fullList.value
  },
  async set(newList: TListItemModel[]) {
    try {
      let newWholeList = []
      if (props.isMain) {
        newWholeList = [...newList, ...note.value.completedListItems]
      } else {
        newWholeList = [...note.value.mainListItems, ...newList, ...fullList.value.slice(listItemsToShow.value)]
      }
      newWholeList.forEach((listItem, index) => {
        listItem.order = index + 1
      })
      await NotesService.setOrder(note.value, newWholeList.map((listItem) => Number(listItem.id)))
    } catch (error) {
      BaseService.eventBus.emit('showGlobalError', { statusCode: 500, message: (error as Error).message })
    }
  },
})

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
    isVariantsShown.value = true
  } else {
    isVariantsShown.value = false
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

async function add() {
  ListItemsService.addListItem(note.value)
}

function hideVariants(event: Event) {
  if (!variantsElement.value?.$el.contains(event.target as Element)) {
    isVariantsShown.value = false
  }
}

function focusVariant(direction: string) {
  if (variants.value.length) {
    const focusedVariant = variants.value.find((variant) => variant.focused)
    const newVariants = variants.value.map((variant) => ({ ...variant, focused: false }))
    let currentIndex = direction === 'down' ? 0 : newVariants.length - 1
    if (focusedVariant) {
      const adding = (direction === 'down' ? 1 : -1)
      const currentVariantIndex = variants.value.indexOf(focusedVariant)
      currentIndex = currentVariantIndex + adding
      if (currentIndex < 0) {
        currentIndex = newVariants.length - 1
      } else if (currentIndex > variants.value.length - 1) {
        currentIndex = 0
      }
    }
    newVariants[currentIndex].focused = true
    variants.value = newVariants
  }
}

function handleKeyDown(event: KeyboardEvent) {
  switch (true) {
    case KeyboardEvents.is(event, KeyboardEvents.ARROW_UP):
      focusVariant('up')
      break
    case KeyboardEvents.is(event, KeyboardEvents.ARROW_DOWN):
      focusVariant('down')
      break
  }
}

function loadMore() {
  setTimeout(async () => {
    if (listItemsToShow.value < fullList.value.length) {
      loadMore()
      listItemsToShow.value += 50
      await nextTick()
      ListItemsService.handleTextAreaHeights($root as HTMLDivElement)
    }
  }, 250)
}

function handleWindowResize() {
  setTimeout(() => {
    ListItemsService.handleTextAreaHeights($root as HTMLDivElement)
  })
}

async function init() {
  $root = rootElement.value

  window.addEventListener('resize', handleWindowResize)
  document.addEventListener('mousedown', hideVariants)
  BaseService.eventBus.on('keydown', handleKeyDown)

  if (props.isMain) {
    handleWindowResize()
  } else {
    setTimeout(() => {
      handleWindowResize()
    }, 100)
  }

  list.value.forEach((listItem) => ListItemsService.addTextareaSwipeEvent(note.value, listItem))
  $root?.querySelectorAll('.list-item textarea').forEach(($textarea) => {
    ListItemsService.addTextareaKeydownEvent($textarea as HTMLTextAreaElement, !props.isMain)
  })

  // Load all list if needed
  if (!props.isMain) {
    loadMore()
  }
}

onMounted(init)

onUnmounted(() => {
  document.removeEventListener('mousedown', hideVariants)
  window.removeEventListener('resize', handleWindowResize)
})

function selectFocusedVariant(event: Event) {
  if (variants.value.length) {
    const focusedListItem = list.value.find((item) => item.focused)
    if (!focusedListItem) {
      throw new Error('Focused list item not found')
    }
    const focusedVariant = variants.value.find((variant) => variant.focused)
    if (focusedVariant) {
      selectVariant(focusedListItem, focusedVariant)
      event.preventDefault()
    }
  }
}

function check(event: Event, listItem: TListItemModel) {
  note.value.checkOrUncheckListItem(listItem, (event.target as HTMLInputElement).checked)
}

function complete(event: Event, listItem: TListItemModel) {
  note.value.completeListItem(listItem, (event.target as HTMLInputElement).checked)
}

async function updateText(listItem: TListItemModel, event?: Event) {
  if (event) {
    const $textarea = event.target as HTMLTextAreaElement
    if (listItem.saveTimeout) {
      clearTimeout(listItem.saveTimeout)
    }
    listItem.text = ($textarea as unknown as HTMLTextAreaElement).value
  }
  listItem.saveTimeout = setTimeout(() => {
    note.value.saveListItem(listItem)
    listItem.saveTimeout = undefined
  }, 400)
  handleSemiFocus()
  if (!listItem.checked && !listItem.completed) {
    await checkVariants(listItem)
  }
}

async function selectVariant(listItem: TListItemModel | null, variant: TVariant) {
  if (listItem) {
    note.value.selectVariant(listItem, variant)
    variants.value = []
  }
}

function showCounterDialog(listItem: TListItemModel) {
  counterListItem.value = listItem
  isCounterDialogShown.value = true
}

function hideCounterDialog(listItem: TListItemModel) {
  counterListItem.value = undefined
  isCounterDialogShown.value = false
}

function setCounterQuantity(number: number) {
  if (counterListItem.value) {
    counterListItem.value.counterQuantity = number
    if (counterListItem.value) {
      counterListItem.value.text = `${counterListItem.value.text.substring(0, counterListItem.value.counterIndex)} — ${number}${String(counterListItem.value.counterMeasurement)}`
      updateText(counterListItem.value)
    }
    isCounterDialogShown.value = false
  }
}

function setCounterMeasurement(measurement: string) {
  if (counterListItem.value) {
    counterListItem.value.counterMeasurement = measurement
    if (counterListItem.value.counterQuantity) {
      counterListItem.value.text = `${counterListItem.value.text.substring(0, counterListItem.value.counterIndex)} ${counterListItem.value.counterQuantity}${measurement}`
      updateText(counterListItem.value)
    }
  }
}

function setDragGhostData(dataTransfer: DataTransfer) {
  dataTransfer.setDragImage(document.createElement('div'), 0, 0)
}

watch(() => isCounterDialogShown.value, async () => {
  await nextTick()
  const $element = document.querySelector('.list-item-counter__list-item')
  $element?.scrollTo(0, $element.scrollHeight)
})
</script>

<style lang="scss" scoped>
.note-list {
  position: relative;

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
    .sortable-ghost {
      position: relative;
      background-color: #fff;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
      z-index: 200;
    }

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

        .list-item__handle {
          width: 30px;
          margin-left: -8px;
        }

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

  .list-item-counter__icon {
    position: absolute;
    right: 0;
    opacity: 0.7;
  }

  .note-list__create-button {
    height: 24px;
    position: relative;
    margin-left: 21px;
    transition: opacity 0.3s;

    &.note-list__create-button--alone {
      margin-left: 0;
    }
  }

  .note-list__menu {
    position: absolute;
    z-index: 30;
  }
}

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

.list-item-counter__container {
  font-size: 24px;
  width: 310px;
  align-self: end;

  .list-item-counter__list-item {
    overflow: auto;
    background-color: rgba(255, 255, 255, 1);
    border-radius: 6px;
  }

  .list-item-counter__numbers {
    .list-item-counter__quantity {
      height: 36px;
      border-radius: 6px;

      &.list-item-counter--current {
        box-shadow: 0 0 15px #fffe00;
        border: 1px solid #ffffff;
        box-sizing: border-box;
      }
    }
  }

  .list-item-counter__measurement {
    border-radius: 6px;

    &.list-item-counter--current {
      box-shadow: 0 0 15px #fffe00;
      border: 1px solid #ffffff;
      box-sizing: border-box;
    }
  }
}
</style>
