<template lang="pug">
q-layout.main-layout(
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
          v-for="index in 6"
          :key="index"
          type="rect"
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
          .q-flex
            q-skeleton.col.bg-grey-3(
              type="rect"
              height="40px"
            )
            q-skeleton.bg-grey-3.ml-2(
              width="40px"
              height="40px"
              type="rect"
            )
          div(
            v-for="index in 10"
            :key="index"
          )
            .q-flex
              q-skeleton.mt-4.bg-grey-3(
                type="rect"
                width="24px"
                height="24px"
              )
              q-skeleton.bg-grey-3.mt-4.ml-2(
                type="rect"
                width="24px"
                height="24px"
              )
              q-skeleton.col.bg-grey-3.mt-4.ml-2(
                type="rect"
                height="24px"
              )
              q-skeleton.bg-grey-3.mt-4.ml-2(
                type="rect"
                width="24px"
                height="24px"
              )
  q-page-container.page.pa-0(v-else)
    router-view.page-content(
      v-slot="{ Component }"
    )
      transition(
        appear
        enter-active-class="animated slideFadeAppear"
      )
        component(
          :is="Component"
        )
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import BaseService from '~/services/base'
import NotesService from '~/composables/services/notes'
import ListItemsService from '~/composables/services/list-items'
import { useGlobalStore } from '~/stores/global'
import { type TGlobalError } from '~/types'

const router = useRouter()
const $q = useQuasar()

const isErrorShown = ref(false)
const globalStore = useGlobalStore()
let removeTimeout: ReturnType<typeof setTimeout> | null = null
const removedItemsQuantity = computed(() => NotesService.removingNotes.value.length + ListItemsService.removingListItems.value.length)
const removedItemsMessage = computed(() => {
  const notesQuantity = NotesService.removingNotes.value.length
  const listItemsQuantity = ListItemsService.removingListItems.value.length
  const notesMessage = notesQuantity ? `${notesQuantity} note${notesQuantity > 1 ? 's' : ''}` : ''
  const middleWord = notesQuantity && listItemsQuantity ? ' and ' : ''
  const listItemsMessage = listItemsQuantity ? `${listItemsQuantity} list item${listItemsQuantity > 1 ? 's' : ''}` : ''
  return `${notesMessage}${middleWord}${listItemsMessage} removed`
})
let notification: null | ((props: object | undefined) => void) = null

BaseService.eventBus.on('showGlobalError', (errorObject: TGlobalError) => {
  globalStore.initError = errorObject
  isErrorShown.value = true
})

if (globalStore.initError) {
  isErrorShown.value = true
}

function handleWindowResize() {
  // Fix 100vh for mobile
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
}

function restoreItems() {
  notification = null
  NotesService.removingNotes.value.forEach((note) => note.restore())
  ListItemsService.removingListItems.value.forEach((listItem) => listItem.restore())
  NotesService.removingNotes.value = []
  ListItemsService.removingListItems.value = []
  if (removeTimeout) {
    clearTimeout(removeTimeout)
  }
}

onMounted(() => {
  handleWindowResize()
  window.addEventListener('resize', handleWindowResize)
})

watch(removedItemsQuantity, () => {
  if (removedItemsQuantity.value) {
    if (!notification) {
      notification = $q.notify({
        group: false, // required to be updatable
        timeout: 0, // we want to be in control when it gets dismissed
        message: removedItemsMessage.value,
        actions: [
          { label: 'Restore', color: 'primary', handler: restoreItems },
        ],
      })
    } else {
      notification({
        message: removedItemsMessage.value,
      })
    }

    if (removeTimeout) {
      clearTimeout(removeTimeout)
    }
    removeTimeout = setTimeout(() => {
      if (notification) {
        notification({ timeout: 1 })
        notification = null
      }
      NotesService.removingNotes.value = []
      ListItemsService.removingListItems.value = []
    }, 7000)
  } else if (notification) {
    notification({ timeout: 1 })
  }
})

watch(
  () => globalStore.initError,
  () => {
    if (globalStore.initError) {
      if (globalStore.initError?.statusCode === 401) {
        router.push('/sign')
      } else {
        isErrorShown.value = true
      }
    }
  },
)

watch(
  () => globalStore.isUpdating,
  () => {
    if (globalStore.isUpdating) {
      const $overlay = document.createElement('div')
      $overlay.classList.add('updating-overlay')
      document.body.appendChild($overlay)
      document.body.classList.add('is-updating')
    } else {
      (document.querySelector('.updating-overlay') as HTMLDivElement).remove()
      document.body.classList.remove('is-updating')
    }
  },
)
</script>

<style lang="scss" scoped>
.note {
  min-width: 250px;
  max-width: 300px;
  height: 300px;
  flex: 1;
}

@media (max-width: 700px) {
  .note {
    min-width: 148px;
    height: 260px;
  }
}

.page {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);

  .page-content {
    position: relative;
  }

  &>div {
    padding-top: 50px;
    overflow-x: hidden;
  }
}
</style>
