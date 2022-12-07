import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface IType {
  id: number
  title: string
  name: string
}
export const TYPE_LIST = 'list'
export const TYPE_TEXT = 'text'

export default function useTypeStore(typeData: IType) {
  return defineStore(`type-${typeData.id}`, () => {
    const id = ref(typeData.id)
    const title = ref(typeData.title || '')
    const name = ref(typeData.name || '')

    return {
      id, title, name,
    }
  })()
}

export type TypeModel = ReturnType<typeof useTypeStore>
