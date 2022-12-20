<template lang="pug">
q-layout(
  view="hHh Lpr fFf"
)
  q-page-container(v-if="isErrorShown")
    ErrorPage(:error="{statusCode: globalStore.initError?.statusCode, message: globalStore.initError?.message}")
  q-page-container(v-else-if="globalStore.isInitDataLoading")
    template(
      v-if="$route.name === 'notes'"
    )
      q-skeleton.bg-grey-3(
        type="rect"
        height="50px"
      )
      .row.pa-4
        q-skeleton.note.bg-grey-3.ma-2(
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
          q-skeleton.bg-grey-3(
            type="rect"
            height="50px"
          )
          .column
            .q-flex.mt-4(
              v-for="index in 10"
              :key="index"
            )
              q-skeleton.bg-grey-3(
                type="rect"
                width="100%"
                height="24px"
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
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseService from '~/services/base'
import type { TGlobalError } from '~/services/base'
import ListItemsService from '~/composables/services/list-items'
import NotesService from '~/composables/services/notes'
import { useGlobalStore } from '~/stores/global'

const router = useRouter()

const isErrorShown = ref(false)
const globalStore = useGlobalStore()
let removeTimeout: ReturnType<typeof setTimeout> | null = null

watch(() => globalStore.initError, () => {
  if (globalStore.initError) {
    if (globalStore.initError?.statusCode === 401) {
      router.push('/sign')
    } else {
      isErrorShown.value = true
    }
  }
})

BaseService.eventBus.on('showGlobalError', (errorObject: TGlobalError) => {
  globalStore.initError = errorObject
  isErrorShown.value = true
})

function handleWindowResize() {
  // Fix 100vh for mobile
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
}
const removedItemsQuantity = computed(() => NotesService.removingNotes.value.length + ListItemsService.removingListItems.value.length)

onMounted(() => {
  handleWindowResize()
  window.addEventListener('resize', handleWindowResize)
})

watch(removedItemsQuantity, () => {
  if (removeTimeout) {
    clearTimeout(removeTimeout)
  }
  removeTimeout = setTimeout(() => {
    if (removedItemsQuantity.value) {
      // NotesService.clear()
      // $store.commit('clearRemovingEntities')
    }
  }, 4000)
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
  height: calc(var(--vh, 1vh) * 100);

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
