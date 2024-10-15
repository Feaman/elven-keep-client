<template lang="pug">
  q-skeleton(
    v-if="!props.onlyList"
    type="rect"
    height="50px"
  )
  .column.flex-center(
    :class="{ 'pa-4' : !props.onlyList }"
  )
    div(
      :style="{ maxWidth: '900px', width: '100%', }"
    )
      .q-flex(
        v-if="!props.onlyList"
      )
        q-skeleton.col.bg-grey-3(
          type="rect"
          height="40px"
        )
        q-skeleton.bg-grey-3.ml-2(
          width="40px"
          height="40px"
          type="rect"
        )
        q-skeleton.bg-grey-3.ml-2(
          width="40px"
          height="40px"
          type="rect"
        )
      .row.flex-center.full-width(
        v-for="index in (props.onlyList ? 5 : 10)"
        :key="index"
        :class="{ 'mt-4': index !== 1, 'mt-2': index === 1 }"
      )
        q-skeleton.bg-grey-3(
          type="rect"
          width="24px"
          height="24px"
        )
        q-skeleton.bg-grey-3.ml-2(
          type="rect"
          width="24px"
          height="24px"
        )
        q-skeleton.col.bg-grey-3.ml-2(
          type="rect"
          height="24px"
        )
</template>

<script setup lang="ts">
const props = defineProps<{
  onlyList?: boolean,
}>()
</script>
