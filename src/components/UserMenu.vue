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
            .user-menu__email.font-size-14.text-grey-8.text--darken-1 {{globalStore.user?.email }}
            .text-grey-5.font-size-11.mt-2 v. {{ applicationVersion }}
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
const { applicationVersion } = process.env
</script>

<style lang="scss" scoped>
.user-menu__email {
  line-height: 16px;
}
</style>
