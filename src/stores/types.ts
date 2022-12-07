import { defineStore } from 'pinia'
import { Ref, ref } from 'vue'
import useTypeStore, { IType, TypeModel, TYPE_LIST } from '~/stores/models/type'

export const useTypesStore = defineStore('types', () => {
  const types: Ref<TypeModel[]> = ref([])

  function generateTypes(typesData: IType[]) {
    typesData.forEach((typeData: IType) => {
      const type = useTypeStore(typeData)
      types.value.push(type)
    })
  }

  function getDefault() {
    const defaultType = types.value.find((type: TypeModel) => type.name === TYPE_LIST)
    if (!defaultType) {
      throw new Error('Default type not found')
    }

    return defaultType
  }

  function findByName(name: string) {
    const type = types.value.find((type: TypeModel) => type.name === name)
    if (!type) {
      throw new Error(`Type '${name}' not found`)
    }

    return type
  }

  return {
    types, generateTypes, getDefault, findByName,
  }
})
