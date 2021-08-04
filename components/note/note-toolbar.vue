<template lang="pug">
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'
import NoteModel from '~/models/note'
import UserModel from '~/models/user'

@Component
export default class NoteToolbar extends Vue {
  @Prop(NoteModel) note!: NoteModel
  @State user!: UserModel

  get isMyNote () {
    return this.user.id === this.note.userId
  }
}
</script>
<style lang="stylus" scoped>
.note-toolbar
  z-index 30
</style>
