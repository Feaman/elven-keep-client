<template lang="pug">
.user-menu
  q-btn(
    :icon="mdiAccountTie"
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
      q-list
        q-item.pa-0
          .bg-grey-4.px-4.pt-2.pb-2.full-width
            .text-weight-bold {{ globalStore.user?.getFio() }}
            .font-size-14.text-grey-8.text--darken-1 {{globalStore.user?.email }}
        q-item.pl-1(
          v-if="globalStore.user"
          clickable
        )
          q-item-section
            q-toggle(
              label="Checked checkboxes"
              v-model="globalStore.user.showChecked"
              color="blue"
            )
        q-item(
          clickable
        )
          q-item-section
            .cursor-pointer.py-1(@click="globalStore.user?.signOut()") Logout
</template>

<script setup lang="ts">
import { mdiAccountTie } from '@quasar/extras/mdi-v6'
import { useGlobalStore } from '~/stores/global'

const globalStore = useGlobalStore()
</script>
