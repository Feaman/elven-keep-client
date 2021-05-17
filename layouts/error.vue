<template lang="pug">
.error-page.d-flex.flex-column.align-center.justify-center.fill-height.white--text.pt-8.pb-12
  .code.font-weight-black.grey--text.text--darken-3.ml-4 Ошибка {{ error.statusCode }}
  img.error-gif.mt-12(src="~/assets/images/error.gif")
  .oops.font-weight-black.mt-4 Упс...
  .text.scroll.font-weight-bold.text-center.green--text.text--lighten-4.px-4 {{ errorText }}
  v-btn.mt-10(
    @click="reloadPage()"
    color="amber accent-2"
  ) НА ЗАГЛАВНУЮ
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

interface ErrorObject {
  statusCode: Number,
  message: String,
}

@Component
export default class ErrorLayout extends Vue {
   @Prop() error!: ErrorObject
   @Prop() message!: String

   errorText = this.error.statusCode === 404 ? 'Страница не найдена' : this.$route.params.message || this.error.message

   mounted () {
     if (this.$route.name === 'login') {
       this.$router.push('/login')
     }
   }

   reloadPage () {
     this.$router.push('/')
   }
}
</script>

<style scoped lang="stylus">
.error-page
  background #2692a9  url("~/assets/images/bg-pattern.png") repeat

  .error-image
    width 50px
    height 50px

  .code
    font-size 30px
    text-align right
    text-transform uppercase

  .oops
    font-size 56px

  .text
    font-size 28px
    line-height 32px
    flex 1
    word-break: break-word;

  .error-gif
    height 72px
</style>
