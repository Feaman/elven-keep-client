<template lang="pug">
q-layout(
  view="hHh Lpr fFf"
)
  q-page-container(v-if="isErrorShown")
    q-banner.text-white.bg-red(
      inline-actions
    ) {{ error?.message }}
      template(v-if="error?.statusCode" v-slot:action)
        q-btn(
          :label="error?.statusCode"
          color="white"
          flat
    )
    q-btn(
      @click="$router.push('/')"
    ) Go to the main page
  q-page-container(v-else)
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
