<template lang="pug">
  .login.fill-height
    v-toolbar(
      color="primary"
      dark
    )
      div ELVEN NOTES
    .d-flex.flex-center.fill-width.height-56.px-8
      .page-content.fill-width
        .headline.fill-width
          div {{ isLoginForm ? 'Login' : 'Register' }}
        .mt-6
          transition(name="slide-fade")
            .login-page.fill-width(v-if="isLoginForm")
              v-text-field(
                v-model="email"
                :counter="RULE_1024_LENGTH"
                name="email"
                label="Email"
                outlined
              )
              v-text-field.mt-2(
                v-model="password"
                :counter="RULE_155_LENGTH"
                type="password"
                name="password"
                label="Password"
                outlined
              )
              .error--text.text-center.mb-3 {{ errors }}
              .d-flex.flex-column.flex-center
                v-btn.d-flex.flex-center(
                  @click="login"
                  :disabled="!isFormValid"
                  :loading="isLoading"
                  color="primary"
                ) Login
                .mt-3.font-size-16 or
                v-btn.d-flex.flex-center(
                  @click="isLoginForm = false"
                  color="black"
                  text
                )
                  .font-weight-bold Register
          transition(name="slide-fade")
            .register-page.fill-width(v-if="!isLoginForm")
              v-text-field(
                v-model="email"
                :counter="RULE_1024_LENGTH"
                type="email"
                label="Email*"
                height="48px"
                dense
                outlined
              )
              v-text-field.mt-2(
                v-model="password"
                :counter="RULE_155_LENGTH"
                type="password"
                label="Password*"
                height="48px"
                dense
                outlined
              )
              v-text-field.mt-2(
                v-model="firstName"
                :counter="RULE_155_LENGTH"
                label="First name*"
                height="48px"
                dense
                outlined
              )
              v-text-field.mt-2(
                v-model="secondName"
                :counter="RULE_155_LENGTH"
                label="Second name*"
                height="48px"
                dense
                outlined
              )
              .error--text.text-center.mb-3 {{ errors }}
              .d-flex.flex-column.flex-center
                v-btn.d-flex.flex-center(
                  @click="register()" :disabled="!isFormValid"
                  :loading="isLoading"
                  color="primary"
                ) Register
                .mt-3.font-size-16 or
                v-btn.d-flex.flex-center(
                  @click="isLoginForm = true"
                  color="black"
                  text
                )
                  .font-weight-bold Login
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import UserService from '~/services/user'

const RULE_155_LENGTH = 155
const RULE_1024_LENGTH = 1024

@Component
export default class SearchComponent extends Vue {
  @State user!: string

  RULE_155_LENGTH = RULE_155_LENGTH
  RULE_1024_LENGTH = RULE_1024_LENGTH
  isLoginForm = true
  isLoading = false
  errors = ''
  email = ''
  firstName = ''
  secondName = ''
  password = ''

  get isFormValid () {
    return this.email.length <= this.RULE_1024_LENGTH &&
      this.firstName.length <= this.RULE_155_LENGTH &&
      this.secondName.length <= this.RULE_155_LENGTH &&
      this.password.length <= this.RULE_155_LENGTH
  }

  async login () {
    this.isLoading = true
    try {
      await UserService.login(this.email, this.password)
      this.$router.push('/')
    } catch (error) {
      this.errors = error.response.data.message
      this.isLoading = false
    }
  }

  async register () {
    this.isLoading = true
    try {
      await UserService.register(this.email, this.password, this.firstName, this.secondName)
      this.$router.push('/')
    } catch (error) {
      this.errors = error.response.data.message
      this.isLoading = false
    }
  }

  async logout () {
    await UserService.logout()
  }

  clear () {
    this.firstName = ''
    this.secondName = ''
    this.email = ''
    this.password = ''
    this.errors = ''
    this.isLoading = false
  }
}
</script>

<style lang="stylus" scoped>
.login

  .height-56
    height calc(100% - 56px)

  .page-content
    height 512px
    position relative
    max-width 500px

    .login-page, .register-page
      position absolute

    .register-page
      ::v-deep .v-label
        top 14px

      ::v-deep input
        padding-top 14px
</style>
