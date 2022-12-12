<template lang="pug">
q-layout(
  view="hHh Lpr fFf"
)
  q-page-container(v-if="isErrorShown")
    ErrorPage(:error="{statusCode: error?.statusCode, message: error?.message}")
  q-page-container.page(v-else)
    router-view
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseService from '~/services/base'
import type { TGlobalError } from '~/services/base'
import { useGlobalStore } from '~/stores/global'

const router = useRouter()

const isErrorShown = ref(false)
const store = useGlobalStore()
const error = ref(store.initError)

if (store.initError) {
  if (error.value?.statusCode === 401) {
    router.push('/sign')
  } else {
    isErrorShown.value = true
  }
}

BaseService.eventBus.on('showGlobalError', (errorObject: TGlobalError) => {
  error.value = errorObject
  isErrorShown.value = true
})

</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
}
</style>
