<template lang="pug">
.note-list(:class="{ fullscreen }")
  .list(
    :class="{ 'pb-3': isMain }"
  )
    draggable(
      v-model="order"
      handle=".handle"
    )
      transition-group(
        name="vertical-list-effect"
      )
        div(
          v-for="(listItem, index) in list"
          :key="listItem._id"
        )
          .list-item.d-flex.align-center(
            :class="listItemClasses(listItem, index)"
          )
            transition( name="scale-fade")
              input.checkbox.mr-1(
                v-if="fullscreen"
                @change="listItem.check($event.target.checked)"
                :checked="listItem.checked"
                :class="{ 'ml-9': !listItem.text }"
                type="checkbox"
                color="secondary"
              )

            q-icon(
              v-if="!fullscreen"
              :name="mdiDrag"
            )

            transition(name="scale-fade")
              input.checkbox.complete-checkbox(
                v-if="!fullscreen"
                @change="listItem.complete($event.target.checked)"
                :checked="listItem.completed"
                type="checkbox"
                color="secondary"
              )

//-             .list-item__text.d-flex.mx-1.ml-2
//-               textarea.fill-width(
//-                 @input="updateText(listItem)"
//-                 @keydown.enter="selectFocusedVariant($event)"
//-                 @focus="listItem.updateState({ focused: true })"
//-                 @blur="handleBlur(listItem)"
//-                 :value="listItem.text"
//-                 :ref="`textarea-${listItem.id || index}`"
//-               )

//-             transition( name="scale-fade")
//-               input.checkbox.mr-1(
//-                 v-if="!fullscreen"
//-                 @change="listItem.check($event.target.checked)"
//-                 :checked="listItem.checked"
//-                 :class="{ 'ml-9': !listItem.text }"
//-                 type="checkbox"
//-                 color="secondary"
//-               )
//-             transition( name="slide-fade")
//-               button.remove-button(
//-                 v-if="!fullscreen"
//-                 @click="listItem.remove()"
//-                 color="grey"
//-               )
//-                 svg.grey--text.text--lighten-1(style="width:24px;height:24px" viewBox="0 0 24 24")
// eslint-disable-next-line
//-                   //- path(fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z")
//-     .new-list-item-button.d-flex.align-center.cursor-text.mt-2(
//-       v-if="this.isMain && !fullscreen"
//-       :class="{ alone: !list.length }"
//-       @click="addNewListItem()"
//-     )
//-       v-icon(
//-         color="grey"
//-       ) mdi-plus
//-       .grey--text.ml-2 Add item

//-   v-menu(
//-     @input="handleMenuInput($event)"
//-     :value="variants.length"
//-     :position-x="variantsMenuX"
//-     :position-y="variantsMenuY"
//-     transition="slide-fade"
//-     max-width="340px"
//-     content-class="hint-menu"
//-     z-index="30"
//-     absolute
//-   )
//-     v-list.variants(
//-       ref="variants"
//-     )
//-       v-list-item.variant.cursor-pointer(
//-         v-for="(variant, index) in variants.slice(0, 10)"
//-         :key="index"
//-         :class="{ focused: variant.focused }"
//-       )
//-         v-list-item-title.d-flex.align-center.fill-width(
//-           @click="selectVariant(variantsListItem, variant)"
//-         )
//-           .limit-width(v-html="variant.highlightedText")
//-           .green--text.font-size-12.ml-2(v-if="variant.isExists") exists
//-           .red--text.font-size-12.ml-2(v-if="variant.duplicatesQuantity") •&nbsp; {{ variant.duplicatesQuantity }}
</template>

<script setup lang="ts">
import { mdiDrag } from '@quasar/extras/mdi-v6'
import { computed } from 'vue'
import { type TListItemModel } from '~/composables/models/list-item'
import { type TNoteModel } from '~/composables/models/note'
import NotesService from '~/composables/services/notes'

const props = defineProps<{
  fullscreen: boolean,
  isMain: boolean,
  note: TNoteModel,
  list: TListItemModel[],
}>()

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
      listItem.updateState({ order: index + 1 })
    })
    if (props.note.id) {
      NotesService.setOrder(props.note, order)
    }
  },
})

function listItemClasses(listItem: TListItemModel, index: number) {
  return {
    first: index === 0,
    focused: listItem.focused,
    checked: listItem.checked,
    completed: listItem.completed,
    'py-1': !props.fullscreen,
    'py-2': props.fullscreen,
  }
}
// import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
// import draggable from 'vuedraggable'
// import NoteModel from '~/models/note'
// import ListItemModel, { Variant } from '~/models/list-item'
// import NotesService from '~/services/notes'
// import KeyboardEvents from '~/services/keyboard-events'
// import BaseService from '~/services/base'
// import ListItemsService from '~/services/list-items'

// @Component({
//   components: {
//     draggable,
//   },
// })
// export default class NoteListComponent extends Vue {
//   saveTimeout: ReturnType<typeof setTimeout> | null = null
//   variants: Variant[] = []
//   variantsMenuX = 0
//   variantsMenuY = 0
//   variantsListItem: ListItemModel | null = null

//   @Prop() list!: ListItemModel[]
//   @Prop() note!: NoteModel
//   @Prop() isMain!: Boolean
//   @Prop() fullscreen!: Boolean

//   @Watch('list')
//   onListChanged () {
//     this.$nextTick(() => {
//       ListItemsService.handleTextAreaHeights(this.list, this.$refs as { [key: string]: HTMLTextAreaElement [] })
//     })
//   }

//   mounted () {
//     if (this.isMain && this.list.length === 1 && !this.list[0].text) {
//       setTimeout(() => {
//         const textareaComponents = this.$refs[`textarea-${this.list[0].id || 0}`] as HTMLTextAreaElement[]
//         textareaComponents[0].focus()
//       })
//     }
//     BaseService.events.$on('keydown', this.handleKeyDown)
//     this.$el.querySelectorAll('.list-item textarea').forEach($textarea => {
//       this.handleTextareaKeydown($textarea as HTMLTextAreaElement)
//     })

//     setTimeout(() => {
//       ListItemsService.handleTextAreaHeights(this.list, this.$refs as { [key: string]: HTMLTextAreaElement[] })
//     })
//   }

//   beforeDestroy () {
//     BaseService.events.$off('keydown', this.handleKeyDown)
//   }

//   handleTextareaKeydown ($textarea: HTMLTextAreaElement) {
//     $textarea.onkeydown = (event: KeyboardEvent) => {
//       if (KeyboardEvents.is(event, KeyboardEvents.ENTER, false, true)) {
//         this.focusNextItem(event)
//       }
//       if (KeyboardEvents.is(event, KeyboardEvents.ENTER, false, false, true)) {
//         this.focusNextItem(event)
//       }
//     }
//   }

//   showVariants (event: MouseEvent) {
//     event.preventDefault()
//     this.variantsMenuX = event.clientX
//     this.variantsMenuY = event.clientY
//   }

//   focusNextItem (event: KeyboardEvent) {
//     const focusedListItem = this.list.find(item => item.focused)
//     if (focusedListItem) {
//       const focusedItemIndex = this.list.indexOf(focusedListItem)
//       if (focusedItemIndex === this.list.length - 1) {
//         if (this.isMain && focusedListItem.text) {
//           this.addNewListItem()
//         } else if (this.isMain && !focusedListItem.id) {
//           const $textarea = this.$el.querySelector('.list .px-3:last-child .list-item textarea') as HTMLTextAreaElement
//           if ($textarea && $textarea.value) {
//             setTimeout(() => {
//               this.addNewListItem()
//             }, 400)
//           } else if ($textarea && !$textarea.value) {
//             this.focusListItem(0)
//           }
//         } else {
//           this.focusListItem(0)
//         }
//       } else {
//         this.focusListItem(focusedItemIndex + 1)
//       }
//     }
//     event.preventDefault()
//   }

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

//   handleMenuInput (isMenuOpened: boolean) {
//     if (!isMenuOpened) {
//       this.variants = []
//     }
//   }

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

//   selectFocusedVariant (event: KeyboardEvent) {
//     if (this.variants.length) {
//       const focusedListItem = this.list.find(item => item.focused)
//       if (!focusedListItem) {
//         throw new Error(`Focused list item not found`)
//       }
//       const focusedVariant = this.variants.find(variant => variant.focused)
//       if (focusedVariant) {
//         this.selectVariant(focusedListItem, focusedVariant)
//         event.preventDefault()
//       }
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

//   addNewListItem () {
//     const listItem = this.note.addListItem()
//     setTimeout(() => {
//       const textareas = this.$refs[`textarea-${listItem.id || this.list.indexOf(listItem)}`] as HTMLTextAreaElement[]
//       if (textareas.length) {
//         const $textarea = textareas[0]
//         this.handleTextareaKeydown($textarea)
//         $textarea.focus()
//         listItem.save()
//       }
//     })
//   }

//   updateText (listItem: ListItemModel) {
//     const $textarea = ListItemsService.handleListItemTextAreaHeight(this.list, listItem, this.$refs as { [key: string]: HTMLTextAreaElement[] })
//     const text = $textarea.value
//     if (this.saveTimeout) {
//       clearTimeout(this.saveTimeout)
//     }
//     listItem.updateState({ text })
//     this.variants = NotesService.findListItemVariants(listItem, text)
//     if (this.variants.length) {
//       this.variantsListItem = listItem
//       const boundingBox = $textarea.getBoundingClientRect()
//       const menuHeight = this.variants.length * 32 + 16
//       const y = boundingBox.y + (boundingBox.y - 56 < menuHeight ? 32 : -menuHeight)
//       this.$nextTick(() => {
//         this.variantsMenuX = boundingBox.x
//         this.variantsMenuY = y
//       })
//     }
//     this.saveTimeout = setTimeout(() => {
//       listItem.update({ text })
//       this.saveTimeout = null
//     }, 400)
//   }

//   selectVariant (listItem: ListItemModel, variant: Variant) {
//     listItem.selectVariant(variant)
//     this.variants = []
//   }

//   handleBlur (listItem: ListItemModel) {
//     listItem.updateState({ focused: false, text: listItem.text })
//     if (this.saveTimeout) {
//       listItem.save()
//     }
//     const $textArea = ListItemsService.getListItemTextarea(this.list, listItem, this.$refs as { [key: string]: HTMLTextAreaElement[] })
//     if ($textArea && $textArea.parentElement) {
//       $textArea.parentElement.scrollTop = 0
//     }
//   }
// }
</script>

<style lang="scss" scoped>
.note-list {
  // &.fullscreen .list-item__text {
  //   font-size: 18px;
  // }

  // .list {
  //   position: relative;
  // }

  // .list .sortable-drag {
  //   opacity: 0 !important;
  // }

  // .list .sortable-ghost {
  //   background-color: #fff;
  //   box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  //   z-index: 20;
  // }

  // .list .checkbox {
  //   min-width: 20px;
  //   min-height: 20px;
  //   color: #f00;
  //   cursor: pointer;
  // }

  // .list .checkbox:note(:checked) {
  //   opacity: 0.3;
  // }

  // .list .list-item {
  //   position: relative;
  //   border-top: 1px solid $inactive-row-color;
  //   border-bottom: 1px solid transparent;
  //   transition: border-top 0.3s, border-bottom 0.3s;
  //   background-color: #fff;
  // }

  // .list .list-item ::v-deep textarea {
  //   overflow: hidden;
  // }

  // .list .list-item .list-item__text {
  //   max-height: 60px;
  //   position: inherit;
  //   transition: height 0.3s;
  //   flex: 1;
  //   position: relative;
  //   overflow: hidden;
  // }

  // .list .list-item .list-item__text.list-item__text--multi-line:after {
  //   content: '...';
  //   width: 100%;
  //   height: 20px;
  //   line-height: 18px;
  //   position: absolute;
  //   top: 38px;
  //   background: #fff;
  //   cursor: text;
  // }

  // .list .list-item .list-item__text textarea {
  //   height: 20px;
  //   border: none;
  //   color: rgba(0, 0, 0, 0.87);
  //   line-height: 20px;
  //   outline: none;
  //   resize: none;
  // }

  // .list .list-item.first {
  //   border-top: 1px solid transparent;
  // }

  // .list .list-item.checked .list-item__text textarea {
  //   color: $grey-lighten-2;
  //   text-decoration: line-through;
  // }

  // .list .list-item.focused {
  //   border-top: 1px solid $grey-lighten-2;
  //   border-bottom: 1px solid $grey-lighten-2;
  // }

  // .list .list-item.focused .list-item__text {
  //   max-height: 178px;
  //   overflow: auto;
  // }

  // .list .list-item.focused .list-item__text:after {
  //   display: none;
  // }

  // .list .list-item .handle {
  //   min-width: 28px;
  //   min-height: 24px;
  //   position: relative;
  //   z-index: 20;
  //   margin-left: -8px;
  //   cursor: pointer;
  // }

  // .list .list-item .remove-button {
  //   min-width: 24px;
  //   height: 24px;
  // }

  // .new-list-item-button {
  //   height: 24px;
  //   margin-left: 18px;
  // }

  // .new-list-item-button.alone {
  //   margin-left: 0;
  // }

}

// .hint-menu .v-list-item {
//   min-height: 32px;
// }

// .variants .variant.focused {
//   background-color: rgba(0, 0, 0, 0.1);
// }
</style>
