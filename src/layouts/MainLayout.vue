<template lang="pug">
q-layout(
  view="hHh Lpr fFf"
)
  q-page-container(v-if="isErrorShown")
    ErrorPage(:error="{statusCode: error?.statusCode, message: error?.message}")
  q-page-container.page.pa-0(v-else)
    .header
    router-view(
      v-slot="{ Component }"
    )
      transition(
        appear
        enter-active-class="animated slideFadeIn"
      )
        component(
          :is="Component"
        )
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
.header {
  width: 100%;
  height: 50px;
  position: absolute;
  background-color: #fbc02d;
  box-shadow: 0 0 10px 2px rgb(0 0 0 / 20%), 0 0px 10px rgb(0 0 0 / 24%);
}

.page {
  height: 100vh;

  &>div {
    padding-top: 50px;
    overflow-x: hidden;
  }
}
</style>
