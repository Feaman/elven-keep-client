import VueObject from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $eventBus: VueObject,
  }
}
