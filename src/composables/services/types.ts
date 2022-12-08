import { computed, ref } from 'vue'
import typeModel, { IType, TypeModel, TYPE_LIST } from '~/composables/models/type'

const types = ref<TypeModel[]>([])

function generateTypes(typesData: IType[]) {
  typesData.forEach((typeData: IType) => {
    types.value.push(typeModel(typeData) as unknown as TypeModel)
  })
}

export const list = computed(() => {
  const defaultType = types.value.find((type: TypeModel) => type.name === TYPE_LIST)
  if (!defaultType) {
    throw new Error('Default type not found')
  }

  return defaultType
})

function findByName(name: string) {
  const type = types.value.find((type: TypeModel) => type.name === name)
  if (!type) {
    throw new Error(`Type '${name}' not found`)
  }

  return type
}

export default {
  types,
  list,
  generateTypes,
  findByName,

}
