<template lang="pug">
q-tooltip(
  :anchor="anchor"
  :self="self"
).text-body2
  slot
</template>

<script setup lang="ts">
defineProps<{
  anchor?: string
  self?: string
}>()
</script>
