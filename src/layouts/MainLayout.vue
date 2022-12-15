<template lang="pug">
q-layout(
  view="hHh Lpr fFf"
)
  q-page-container(v-if="isErrorShown")
    ErrorPage(:error="{statusCode: error?.statusCode, message: error?.message}")
  q-page-container(v-else-if="store.isInitDataLoading")
    template(
      v-if="$route.name === 'notes'"
    )
      q-skeleton(
        type="rect"
        height="50px"
      )
      .row.pa-4
        q-skeleton.note.ma-2(
          v-for="index in 4"
          :key="index"
          type="rect"
          width="250px"
          height="300px"
        )
    template(
      v-if="['existed-note', 'new-note'].includes(String($route.name))"
    )
      q-skeleton(
        type="rect"
        height="50px"
      )
      .column.flex-center.pa-4
        div(
          :style="{ maxWidth: '900px', width: '100%', }"
        )
          q-skeleton(
            type="rect"
            height="50px"
          )
          .column.mt-4
            .q-flex.mt-4(
              v-for="index in 10"
              :key="index"
            )
              q-skeleton(
                type="rect"
                width="28px"
                height="28px"
              )
              q-skeleton.ml-2(
                type="rect"
                width="28px"
                height="28px"
              )
              q-skeleton.ml-2(
                type="rect"
                width="calc(100% - 112px)"
                height="28px"
              )
              q-skeleton.ml-2(
                type="rect"
                width="28px"
                height="28px"
              )
              q-skeleton.ml-2(
                type="rect"
                width="28px"
                height="28px"
              )
          .q-flex.mt-4.ml-9
            q-skeleton(
              type="rect"
              width="28px"
              height="28px"
            )
            q-skeleton.ml-2(
              type="rect"
              width="120px"
              height="28px"
            )
  q-page-container.page.pa-0(v-else)
    .header
    router-view.page-content(
      v-slot="{ Component }"
    )
      transition(
        appear
        enter-active-class="animated slideFadeIn"
      )
        component(
          :is="Component"
          :key="$route.path"
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
.note {
  min-width: 250px;
  max-width: 300px;
  height: 260px;
  flex: 1;
}

.page {
  height: 100vh;

  .header {
    width: 100%;
    height: 50px;
    position: absolute;
    background-color: #fbc02d;
  }

  .page-content {
    position: relative;
  }

  &>div {
    padding-top: 50px;
    overflow-x: hidden;
  }
}
</style>
