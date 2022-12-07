<template lang="pug">
q-banner.text-white.bg-red(
  inline-actions
) Страница не найдена
  template(
    v-slot:action
  )
    q-btn(
      label="404"
      color="white"
      flat
    )
</template>

<script setup lang="ts">
</script>

<style lang="scss">
</style>
