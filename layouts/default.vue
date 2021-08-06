<template lang="pug">
v-app
  v-main
    .d-flex.fill-height.flex-center(
      v-if="isInitInfoLoading"
    )
      v-progress-circular(
        color="primary"
        indeterminate
      )
    nuxt(
      v-else
    )
  v-snackbar(
    :value="removedItemsQuantity"
    :timeout="-1"
  )
    .d-flex(
      v-if="removedItemsQuantity"
    )
      div(
        v-if="removingEntities.notes.length"
      ) {{ removingEntities.notes.length }} note{{ removingEntities.notes.length > 1 ? 's' : ''}}
      div(
        v-if="removingEntities.notes.length && removingEntities.listItems.length"
      ) &nbsp;and
      div(
        v-if="removingEntities.listItems.length"
      ) &nbsp;{{ removingEntities.listItems.length }} list item{{ removingEntities.listItems.length > 1 ? 's' : ''}}
      div &nbsp;removed
    template(
      v-slot:action="{ attrs }"
    )
      v-btn(
        @click="undoRemoving()"
        v-bind="attrs"
        color="primary"
        text
      ) Undo
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import NotesService from '~/services/notes'
import { IRemovingEntities } from '~/store'

@Component
export default class DefaultLayout extends Vue {
  removeTimeout: ReturnType<typeof setTimeout> | null = null

  @State(state => state.isInitInfoLoading) isInitInfoLoading!: boolean
  @State(state => state.removingEntities) removingEntities!: IRemovingEntities

  get removedItemsQuantity () {
    const removedItemsQuantity = this.removingEntities.notes.length + this.removingEntities.listItems.length
    if (this.removeTimeout) {
      clearTimeout(this.removeTimeout)
    }
    this.removeTimeout = setTimeout(() => {
      if (removedItemsQuantity) {
        NotesService.clear()
        this.$store.commit('clearRemovingEntities')
      }
    }, 4000)

    return removedItemsQuantity
  }

  mounted () {
    this.handleWindowResize()
    window.addEventListener('resize', this.handleWindowResize)
  }

  handleWindowResize () {
    // Fix 100vh for mobile
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
  }

  undoRemoving () {
    this.removingEntities.notes.forEach(note => note.restore())
    this.removingEntities.listItems.forEach(listItem => listItem.restore())
    this.$store.commit('clearRemovingEntities')
    if (this.removeTimeout) {
      clearTimeout(this.removeTimeout)
    }
  }
}
</script>

<style lang="stylus" scoped>
::v-deep .v-main__wrap
  height 100vh
  height calc(var(--vh, 1vh) * 100)
  transition height 0.1s
</style>
