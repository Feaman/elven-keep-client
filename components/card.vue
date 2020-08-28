<template lang="pug">
.card.column
  input.title(
    v-model="title"
  )
  textarea.text(
    v-model="text"
    ref="textarea"
  )
  .footer
    .button.center(
      @click="remove(card)"
      title="Delete card"
    )
      .icon(
        v-html="$svg.delete"
      )
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref, Watch } from 'vue-property-decorator'
import CardModel from '~/models/card'

@Component
export default class CardsComponent extends Vue {
  @Prop(CardModel) card!: CardModel

  @Ref('textarea') $textarea!: HTMLTextAreaElement

  @Watch('title')
  onTitleChanged () {
    this.card.save(this.title, this.text)
  }

  @Watch('text')
  onTextChanged () {
    this.recalculateTextHeight()
    this.card.save(this.title, this.text)
  }

  title = this.card.title
  text = this.card.text

  mounted (): void {
    this.recalculateTextHeight()
  }

  remove (card: CardModel): void {
    card.delete()
  }

  recalculateTextHeight (): void {
    this.$textarea.style.height = 'auto'
    this.$textarea.style.height = this.$textarea.scrollHeight + 'px'
  }
}
</script>

<style lang="stylus" scoped>
@import '~assets/css/mixins'

.card
  min-width 112px
  height fit-content
  box-shadow 0 0 5px rgba(0, 0, 0, 0.3)
  border-radius 6px
  padding 16px

  .title, .text
    border none
    outline none
    font-family()

  .title
    font-weight bold
    font-size 18px

  .text
    margin 8px 0 0 0
    resize none

  .footer
    .button
      width 28px
      height 28px
      border-radius 6px
      cursor pointer

      &:hover
        background-color rgba(0, 0, 0, 0.1)

      .icon
        width 20px
        height 20px
</style>
