<template lang="pug">
.note-list
  .list(
    :class="{ 'pb-3': showNewButton }"
  )
    draggable(
      v-model="order"
      handle=".handle"
    )
      transition-group(
        name="vertical-list-effect"
      )
        .px-3(
          v-for="(listItem, index) in list"
          :key="listItem._id"
        )
          .list-item.d-flex.align-center.py-1(
            :class="{ first: index === 0, focused: listItem.focused, checked: listItem.checked, completed: listItem.completed }"
          )
            v-icon.handle mdi-drag
            transition(name="scale-fade")
              v-checkbox.complete-checkbox.ma-0.pa-0(
                v-if="listItem.text"
                @change="listItem.complete($event)"
                :input-value="!!listItem.completed"
                :disabled="!listItem.text"
                color="primary"
                hide-details
              )
            v-menu(
              :value="listItem.variants.length"
              transition="slide-fade"
              max-width="300px"
              content-class="hint-menu"
              offset-y
              :top="list.indexOf(listItem) > 0"
              :bottom="list.indexOf(listItem) === 0"
            )
              template(
                v-slot:activator="{ on, attrs }"
              )
                v-textarea.list-item__text.fill-width.mx-1.ml-8.mt-1.pa-0(
                  @input="updateText(listItem, $event)"
                  @keydown.enter="selectFocusedVariant($event)"
                  @focus="listItem.updateState({ focused: true })"
                  @blur="handleBlur(listItem)"
                  :value="listItem.text"
                  :ref="`textarea-${listItem.id || -index}`"
                  :rows="1"
                  hide-details
                  auto-grow
                )
              v-list.variants
                v-list-item.variant.cursor-pointer(
                  v-for="(variant, index) in listItem.variants.slice(0, 4)"
                  :key="index"
                  :class="{ focused: variant.focused }"
                )
                  v-list-item-title.d-flex.align-center.fill-width(
                    @click="selectVariant(listItem, variant)"
                  )
                    .limit-width {{ variant.text }}
                    .green--text.font-size-12.ml-2(v-if="variant.isExists") exists
            transition(name="scale-fade")
              v-checkbox.ma-0.mr-1.pa-0(
                v-if="listItem.text"
                @change="listItem.check($event)"
                :input-value="!!listItem.checked"
                :disabled="!listItem.text"
                :class="{ 'ml-9': !listItem.text }"
                color="primary"
                hide-details
              )
            transition(name="slide-fade")
              v-btn.remove-button(
                v-if="listItem.text"
                @click="listItem.remove()"
                color="grey"
                icon
              )
                v-icon(color="grey lighten-2") mdi-close
    transition(name="slide-fade")
      .new-list-item-button.d-flex.align-center.cursor-text.mt-2.ml-8(
        v-if="showNewButton"
        @click="addNewListItem()"
      )
        v-icon(
          color="grey"
        ) mdi-plus
        .grey--text.ml-2 Add item
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import draggable from 'vuedraggable'
import NoteModel from '~/models/note'
import ListItemModel, { Variant } from '~/models/list-item'
import ListItemsService from '~/services/list-items'
import NotesService from '~/services/notes'
import KeyboardEvents from '~/services/keyboard-events'
import BaseService from '~/services/base'

@Component({
  components: {
    draggable,
  },
})
export default class NoteListComponent extends Vue {
  saveTimeout: ReturnType<typeof setTimeout> | null = null

  @Prop() list!: ListItemModel[]
  @Prop() note!: NoteModel
  @Prop() isMain!: Boolean

  @Watch('order')
  onOrderChanged () {
    this.order.forEach((listItemId, index) => {
      const listItem = this.list.find((listItem: ListItemModel) => listItem.id === listItemId)
      if (listItem) {
        listItem.updateState({ order: index + 1 })
      }
    })
    if (this.note.id) {
      NotesService.setOrder(this.note, this.order)
    }
  }

  order: number[] = []

  get showNewButton () {
    return !!this.isMain && (!this.list.find(item => !item.text) || !this.list.length)
  }

  created () {
    this.list.forEach((listItem: ListItemModel) => this.order.push(listItem.id || 0))
  }

  mounted () {
    if (this.isMain && this.list.length === 1 && !this.list[0].text) {
      setTimeout(() => {
        const textareaComponents = this.$refs[`textarea-${this.list[0].id || 0}`] as HTMLTextAreaElement[]
        textareaComponents[0].focus()
      })
    }
    BaseService.events.$on('keydown', this.handleKeyDown)
  }

  handleKeyDown (event: KeyboardEvent) {
    switch (true) {
      case KeyboardEvents.is(event, KeyboardEvents.ARROW_UP):
        this.focusVariant('up')
        break
      case KeyboardEvents.is(event, KeyboardEvents.ARROW_DOWN):
        this.focusVariant('down')
        break
    }
  }

  selectFocusedVariant (event: KeyboardEvent) {
    const listItem = this.list.find(item => item.focused)
    if (listItem) {
      const focusedVariant = listItem.variants.find(variant => variant.focused)
      if (focusedVariant) {
        this.selectVariant(listItem, focusedVariant)
      }
      setTimeout(() => listItem.update({ text: listItem.text?.trim() }), 400)
    }
    event.stopPropagation()
  }

  async focusVariant (direction: string) {
    const listItem = this.list.find(item => item.focused)
    if (listItem) {
      const focusedVariant = listItem.variants.find(variant => variant.focused)
      const variants = listItem.variants.map(variant => Object.assign({}, variant, { focused: false }))
      if (variants.length) {
        let currentIndex = direction === 'down' ? 0 : variants.length - 1
        if (focusedVariant) {
          const adding = (direction === 'down' ? 1 : -1)
          const currentVariantIndex = listItem.variants.indexOf(focusedVariant)
          currentIndex = currentVariantIndex + adding
          if (currentIndex < 0) {
            currentIndex = variants.length - 1
          } else if (currentIndex > listItem.variants.length - 1) {
            currentIndex = 0
          }
        }
        variants[currentIndex].focused = true
        await listItem.updateState({ variants })
      }
    }
  }

  async addNewListItem () {
    const listItem = await this.note.addListItem()
    setTimeout(() => {
      const textareaComponents = this.$refs[`textarea-${listItem.id || -(this.list.indexOf(listItem))}`] as HTMLTextAreaElement[]
      textareaComponents[textareaComponents.length - 1].focus()
    })
  }

  updateText (listItem: ListItemModel, text: string) {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }
    this.saveTimeout = setTimeout(async () => {
      if (text) {
        await listItem.updateState({ variants: NotesService.findListItemVariants(listItem, text) })
      } else {
        await listItem.updateState({ variants: [] })
        await listItem.remove(false)
      }
      listItem.update({ text })
    }, 300)
  }

  selectVariant (listItem: ListItemModel, variant: Variant) {
    if (variant.noteId === listItem.noteId && variant.listItemId !== listItem.id) {
      const existentListItem = this.note.list.find((listItem: ListItemModel) => listItem.id === variant.listItemId)
      if (existentListItem) {
        existentListItem.update({ completed: false, checked: false, order: ListItemsService.generateMaxOrder(listItem) })
        listItem.remove()
      }
    } else {
      listItem.update({ text: variant.text })
    }
  }

  handleBlur (listItem: ListItemModel) {
    listItem.updateState({ focused: false })
    if (!listItem.text) {
      listItem.removeFromState()
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~assets/css/variables'
@import '~assets/css/mixins'

$inactive-row-color = #F5F5F5

.note-list
  margin 0 -12px

  .list
    .sortable-drag
      opacity 0 !important

    .sortable-ghost
      background-color #fff
      box-shadow 0 0 5px rgba(0, 0, 0, 0.3)
      z-index 20

    .list-item
      position relative
      border-top  1px solid $inactive-row-color
      border-bottom  1px solid transparent
      transition border-top 0.3s, border-bottom 0.3s

      .complete-checkbox
        position absolute
        left 22px

      &.first
        border-top  1px solid transparent

      &.checked
        ::v-deep .v-input .v-input__slot textarea
          color $grey-lighten-2
          text-decoration line-through

      &.focused
        border-top  1px solid $grey-lighten-1
        border-bottom  1px solid $grey-lighten-1

      .handle
        position relative
        z-index 20
        margin-left -4px

      .v-input
        ::v-deep .v-input--selection-controls__input
          margin 0

        ::v-deep .mdi-checkbox-blank-outline
          &:before
            color $grey-lighten-2

        ::v-deep .v-input__slot
          textarea
            min-height 24px
            border none
            outline none
            resize none
            text-decoration none
            line-height 20px

          &:before, &:after
            border none
            border-color transparent

      .remove-button
        width 28px
        height 28px
        margin-right -8px

  .new-list-item-button
    height 24px

  .limit-width
    limit-width(100%)

.hint-menu
  .v-list-item
    min-height 32px

.variants
  .variant.focused
    background-color rgba(0, 0, 0, 0.1)
</style>
