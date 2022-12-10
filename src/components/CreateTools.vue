<template lang="pug">
q-btn(
  @click="router.push('/new/list')"
  :icon="mdiFormatListBulletedSquare"
  color="black"
  flat
  round
)
  ToolTip Create list note
q-btn(
  @click="router.push('/new/text')"
  :icon="mdiTextBoxOutline"
  color="black"
  flat
  round
)
  ToolTip Create text note
</template>
