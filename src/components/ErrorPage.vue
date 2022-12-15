<template lang="pug">
.error-page.pa-4
  .error-page__image-container.flex.flex-center
    img.error-page__image(
      src="~assets/crying-girl.jpg"
    )
  .error-page__error.column.text-center.full-width.full-height
    .text-h1.text-yellow-7.text-weight-bold {{ error.statusCode }}
    .text-h3.text-weight-bold.mt-8 Awww... What the dragon?!
    .error-page__message.text-h4.text-blue-5.font-size-18.ml-1.mt-8 {{ error.message }}
    q-btn(
      label="404"
      color="white"
      flat
    )
</template>

<script setup lang="ts">
import type { TGlobalError } from '~/services/base'

defineProps<{
  error: TGlobalError,
}>()
</script>

<style lang="scss" scoped>
.error-page {
  width: 100%;
  height: 100vh;
  display: flex;

  .error-page__image-container {

    .error-page__image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .error-page__error {
    min-width: calc(50% - 16px);
    align-items: center;
    justify-content: center;

    .error-page__message {
      line-height: 20px;
    }
  }
}

@media (max-width: 1100px) {
  .error-page {
    flex-direction: column;

    .error-page__image-container {
      max-height: 30vh;
    }

    .error-page__error {
      justify-content: start;
      margin-top: 10%;
    }
  }
}
</style>
