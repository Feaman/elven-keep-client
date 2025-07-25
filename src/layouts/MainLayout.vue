<template lang="pug">
q-layout.main-layout(
  view="hHh Lpr fFf"
)
  q-page-container(v-if="isNoOfflineDataError")
    .offline-data-error.q-flex.flex-center.pa-8
      q-card
        q-toolbar.q-flex.bg-primary.shadow-3
          q-toolbar-title.ml-2
            .q-flex.items-center
              q-icon(
                :name="mdiAlertDecagram"
                size="sm"
                color="red"
              )
              .font-size-18.ml-2 Connection error
          q-btn(
            @click="showDialog = false"
            :icon="mdiClose"
            color="black"
            flat
            round
            dense
          )
        .pa-6
          .font-size-18 Looks like there is no Internet here. To use this app in offline mode you should be authorized and start the app online at least once.
  q-page-container(v-else-if="isErrorShown")
    ErrorPage(:error="{statusCode: globalStore.initError?.statusCode, message: globalStore.initError?.message}")
  q-page-container(v-else-if="globalStore.isInitDataLoading")
    template(
      v-if="$route.name === 'notes'"
    )
      q-skeleton.bg-grey-3(
        type="rect"
        height="50px"
      )
      .column
        .row.pa-4
          q-skeleton.note.bg-grey-3.ma-2(
            v-for="index in 6"
            :key="index"
            type="rect"
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
      NotListSkeletons
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
import {
  mdiAlertDecagram,
  mdiClose,
} from '@quasar/extras/mdi-v6'
import BaseService from '~/services/base'
import NotesService from '~/composables/services/notes'
import ListItemsService from '~/composables/services/list-items'
import { useGlobalStore } from '~/stores/global'
import { type TGlobalError } from '~/types'
import { ROUTE_SIGN } from '~/router/routes'
import SyncService from '~/services/sync'

const router = useRouter()
const $q = useQuasar()

let isNoOfflineDataError = false
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
let updateNotification: null | ((props: object | undefined) => void) = null

BaseService.eventBus.on('showGlobalError', (errorObject: TGlobalError) => {
  globalStore.initError = errorObject
  isErrorShown.value = true
})

if (globalStore.initError) {
  isErrorShown.value = true
}

if (globalStore.isNoOfflineDataError) {
  isNoOfflineDataError = true
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

function handleWindowResize() {
  // Fix 100vh for mobile
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
}

onMounted(() => {
  handleWindowResize()
  window.addEventListener('resize', handleWindowResize)
  setTimeout(() => {
    globalStore.isInitialLoading = false
  }, 1000)
})

watch(removedItemsQuantity, () => {
  try {
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
          notification({
            timeout: 1,
            actions: [],
          })
          notification = null
        }
        SyncService.removeRemovedEntities()
      }, 5000)
    } else if (notification) {
      notification({ timeout: 1, actions: [] })
    }
  } catch (error) {
    BaseService.showError(error as Error)
  }
})

watch(
  () => globalStore.initError,
  () => isErrorShown.value = !!globalStore.initError,
)

watch(
  () => globalStore.isUpdating,
  () => {
    if (globalStore.isUpdating) {
      updateNotification = $q.notify({
        group: false,
        message: 'Updating...',
        textColor: 'primary',
        icon: 'update',
        timeout: 0,
      })
    } else if (updateNotification) {
      updateNotification({
        timeout: 1,
      })
      updateNotification = null
    }
  },
)
</script>

<style lang="scss" scoped>
.offline-data-error {
  height: 100vh;

  .q-card {
    width: 500px;
  }
}

.note {
  min-width: 250px;
  max-width: 300px;
  height: 260px;
  flex: 1;
}

.is-loading-icon {
  position: fixed;
  top: calc(100% - 60px);
  right: 20px;
  z-index: 30;
}

@media (max-width: 700px) {
  .note {
    min-width: 148px;
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
