<template lang="pug">
.user-menu
  q-btn(
    :icon="mdiAccountOutline"
    color="black"
    flat
    round
  )
    q-menu(
      style="min-width: 246px"
      max-width="246px"
      transition-show="scale"
      transition-hide="jump-left"
    )
      q-list(
        separator
      )
        q-item.shadow-1.pa-0
          .bg-grey-3.px-4.pt-2.pb-2.full-width
            .text-weight-bold {{ globalStore.user?.getFio() }}
            .font-size-14.text-grey-8.text--darken-1 {{globalStore.user?.email }}
        q-item(
          @click="globalStore.user?.signOut()"
          clickable
        )
          q-item-section
            .q-flex.items-center
              q-icon(
                :name="mdiLogout"
                color="black"
              )
              .cursor-pointer.py-1.ml-2 Sign out
</template>

<script setup lang="ts">
import { mdiAccountOutline, mdiLogout } from '@quasar/extras/mdi-v6'
import { useGlobalStore } from '~/stores/global'

const globalStore = useGlobalStore()
</script>
