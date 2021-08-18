<template lang="pug">
.saving
  .d-flex.align-center(v-if="isNoteSaving")
    v-tooltip(bottom)
      template(v-slot:activator="{ on, attrs }")
        v-icon(
          color="black"
          v-bind="attrs"
          v-on="on"
        ) mdi-cloud-upload-outline
      span Saving to cloud
  .d-flex.align-center.black--text(v-if="!isNoteSaving")
    v-tooltip(bottom)
      template(v-slot:activator="{ on, attrs }")
        v-icon(
          color="black"
          v-bind="attrs"
          v-on="on"
        ) mdi-cloud-check-outline
      span Saved to cloud
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class NoteSavingComponent extends Vue {
  @State(state => state.isNoteSaving) isNoteSaving!: boolean
}
</script>
