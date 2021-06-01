<template lang="pug">
.error-page.d-flex.flex-column.align-center.justify-center.fill-height.white--text.pt-8.pb-12
  .container.d-flex.flex-column.align-center.justify-center.fill-height
    img.error-gif(src="~/assets/images/error.gif")
    .oops.font-weight-black.mt-8 Упс...
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
  response: { data: { message: string }},
  message: string,
}

@Component({
  layout: 'plain'
})
export default class ErrorLayout extends Vue {
   @Prop() error!: ErrorObject
   @Prop() message!: String

   errorText = ''

   created () {
     if (this.error.statusCode === 404) {
       this.errorText = 'Страница не найдена'
     } else {
       this.errorText = this.error.response?.data?.message || this.error.message
     }
   }

   mounted () {
     if (this.$route.name === 'login') {
       this.$router.push('/login')
     }
   }

   reloadPage () {
     window.location.href = '/'
   }
}
</script>

<style scoped lang="stylus">
.error-page
  background #2692a9  url("~/assets/images/bg-pattern.png") repeat

  .container
    max-height 700px

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
      max-width 980px
      max-height 250px
      font-size 28px
      line-height 32px
      flex 1
      word-break: break-word;
      overflow auto

    .error-gif
      height 72px
</style>
