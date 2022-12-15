<template lang="pug">
.user-menu
  q-btn(
    :icon="mdiAccountTie"
    color="black"
    flat
    round
  )
    q-menu(
      max-width="380px"
      transition-show="scale"
      transition-hide="jump-left"
    )
      .bg-grey-4.px-4.pt-2.pb-2
        .text-weight-bold {{ globalStore.user?.getFio() }}
        .font-size-14.text-grey-8.text--darken-1 {{globalStore.user?.email }}
      q-list
        q-item
          q-item-section
            .cursor-pointer.py-1(@click="globalStore.user?.signOut()") Logout
</template>

<script setup lang="ts">
import { mdiAccountTie } from '@quasar/extras/mdi-v6'
import { useGlobalStore } from '~/stores/global'

const globalStore = useGlobalStore()
</script>
