<template lang="pug">
.saving
  transition(name="fade")
    .block.d-flex.align-center(v-if="isNoteSaving")
      .grey--text.text--lighten-3.font-size-13.mr-2 Saving
      v-progress-circular(
        color="grey lighten-2"
        size="24"
        width="2"
        indeterminate
      )
  transition(name="fade")
    .block.d-flex.align-center(v-if="!isNoteSaving")
      .grey--text.text--lighten-3.font-size-13.mr-2 Saved
      v-icon mdi-cloud-outline
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class NoteListComponent extends Vue {
  @State(state => state.isNoteSaving) isNoteSaving!: boolean
}
</script>

<style lang="stylus" scoped>
.saving
  width 68px
  height 24px
  position relative

  .block
    position absolute
</style>
