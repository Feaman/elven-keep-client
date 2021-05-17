<template lang="pug" >
div
  cards
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
  transition: 'slide-fade'
})
export default class IndexPage extends Vue {
}
</script>
