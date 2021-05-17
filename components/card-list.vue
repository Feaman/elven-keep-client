<template lang="pug">
.card-list
  .list
    transition-group(
      name="vertical-list-effect"
    )
      div(
        v-for="(listItem, index) in list"
        :key="listItem._id"
      )
        .list-item.d-flex.align-center.py-1(
          :class="{ first: index === 0, focused: listItem.focused, checked: listItem.checked, completed: listItem.completed }"
        )
          v-checkbox.ma-0.pa-0(
            @change="listItem.update({ completed: !!$event })"
            :input-value="!!listItem.completed"
            :disabled="!listItem.text"
            color="primary"
            hide-details
          )
          v-textarea.list-item__text.fill-width.mx-1.mt-1.pa-0(
            @input="listItem.update({ text: $event })"
            @focus="listItem.update({ focused: true })"
            @blur="listItem.update({ focused: false })"
            :value="listItem.text"
            :ref="`textarea-${listItem.id || -index}`"
            :rows="1"
            hide-details
            auto-grow
          )
          v-checkbox.ma-0.pa-0(
            @change="listItem.update({ checked: !!$event })"
            :input-value="!!listItem.checked"
            :disabled="!listItem.text"
            color="primary"
            hide-details
          )
          v-btn.remove-button(
            v-if="list.length > 1 || list[0].text"
            @click="listItem.remove()"
            color="grey lighten-2"
            icon
          )
            v-icon mdi-close
    .new-list-item-button.mt-2
      transition(name="slide-fade")
        .d-flex.align-center.cursor-text(
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

$inactive-row-color = #ECEFF1

.card-list
  .list
    .list-item
      border-top  1px solid $inactive-row-color
      border-bottom  1px solid transparent
      transition border-top 0.3s, border-bottom 0.3s

      &.first
        border-top  1px solid transparent

      &.checked
        ::v-deep .v-input .v-input__slot textarea
          color $grey-lighten-2
          text-decoration line-through

      &.focused
        border-top  1px solid $grey-darken-1
        border-bottom  1px solid $grey-darken-1

      .v-input
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
        margin-right -8px

  .new-list-item-button
    height 24px

@media (max-width: 600px)
  ::v-deep .mdi-checkbox-blank-outline, ::v-deep .mdi-checkbox-marked
    &:before
      font-size 28px
</style>
