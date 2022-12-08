<template lang="pug">
.sign-page.full-width
  q-header(
    elevated
  )
    q-toolbar
      h6.text-black.text-weight-bold.q-ma-none.q-pl-sm ELVEN NOTES
  .row.flex-center.full-width
    .sign-page__container.column.flex-center.full-width.q-px-lg
      h5.full-width.text-left.q-ma-none Sign {{ isSignIn ? 'In' : 'Up' }}
      q-input.full-width.q-mt-lg(
        v-model="email"
        label="Email"
        type="email"
        outlined
      )
      q-input.full-width.q-mt-lg(
        v-model="password"
        label="Password"
        outlined
      )
      transition(
        appear
        enter-active-class="animated zoomIn"
        leave-active-class="animated zoomOut"
      )
        .text-red.q-mt-lg(
          v-if="errorText"
        ) {{ errorText }}

      q-btn.q-mt-lg(
        @click="login"
        label="Sign In"
        color="primary"
      )
      .q-mt-lg OR
      q-btn.q-mt-md(
        label="Sign Up"
        flat
      )
</template>

<script setup lang="ts">
import { AxiosError } from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import suersService from '~/composables/services/users'

const router = useRouter()

const isSignIn = ref(true)
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorText = ref('')

async function login() {
  isLoading.value = true
  try {
    await suersService.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    errorText.value = (error as AxiosError).response?.data?.message || 'Unexpected error'
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.sign-page {
  .sign-page__container {
    max-width: 500px;
  }
}
</style>
