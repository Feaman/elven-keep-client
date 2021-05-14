<template lang="pug">
.card-list
  .list
    transition-group(
      name="list-effect"
    )
      div(
        v-for="(listItem, index) in list"
        :key="listItem._id"
      )
        .list-item.d-flex.align-center(
          :class="{ focused: listItem.focused, checked: listItem.checked, completed: listItem.completed }"
        )
          v-checkbox.ma-0.pa-0(
            @change="listItem.update({ completed: !!$event })"
            :input-value="!!listItem.completed"
            :disabled="!listItem.text"
            color="purple"
            hide-details
          )
          v-textarea.list-item__text.fill-width.mx-2.my-1.pa-0(
            @input="listItem.update({ text: $event })"
            @focus="listItem.update({ focused: true })"
            @blur="listItem.update({ focused: false })"
            :value="listItem.text"
            :ref="`textarea-${listItem.id || -index}`"
            rows="1"
            hide-details
            auto-grow
          )
          v-checkbox.ma-0.pa-0(
            @change="listItem.update({ checked: !!$event })"
            :input-value="!!listItem.checked"
            :disabled="!listItem.text"
            color="purple"
            hide-details
          )
          v-btn(
            v-if="list.length > 1 || list[0].text"
            @click="listItem.remove()"
            icon
          )
            v-icon mdi-close
    transition(name="slide-fade")
      .d-flex.align-center.mt-2.cursor-text(
        v-if="isMain && !list.find(item => !item.text)"
        @click="addNewListItem()"
      )
        v-icon(
          color="grey"
        ) mdi-plus
        .grey--text.ml-4 Add item
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import CardModel from '~/models/card'
import ListItemModel from '~/models/list-item'

@Component
export default class CardListComponent extends Vue {
  @Prop() list!: ListItemModel[]
  @Prop() card!: CardModel
  @Prop() isMain!: Boolean

  mounted () {
    if (this.isMain && this.list.length === 1) {
      setTimeout(() => {
        const textareaComponents = this.$refs[`textarea-${this.list[0].id || 0}`] as HTMLTextAreaElement[]
        textareaComponents[0].focus()
      })
    }
  }

  addNewListItem () {
    const listItem = new ListItemModel({ card: this.card })
    this.card.addListItem(listItem)
    setTimeout(() => {
      const textareaComponents = this.$refs[`textarea-${listItem.id || -(this.list.indexOf(listItem))}`] as HTMLTextAreaElement[]
      textareaComponents[textareaComponents.length - 1].focus()
    })
  }
}
</script>

<style lang="stylus" scoped>
@import '~assets/css/variables'

$active-row-color = #CFD8DC

.card-list
  .list
    .list-item
      border-top  1px solid transparent
      border-bottom  1px solid transparent
      transition border-top 0.3s, border-bottom 0.3s

      &.checked, &.completed
        ::v-deep .v-input__slot textarea
          color $blue-grey-lighten-3

      &.checked
        ::v-deep .v-input__slot textarea
          text-decoration line-through

      &.focused
        border-top  1px solid $active-row-color
        border-bottom  1px solid $active-row-color

      ::v-deep .v-input__slot
        textarea
          min-height 24px
          border none
          outline none
          resize none
          text-decoration none

        &:before, &:after
          border none
          border-color transparent
</style>
