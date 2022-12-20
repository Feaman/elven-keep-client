import { computed, ref } from 'vue'
import typeModel, { IType, TTypeModel, TYPE_LIST } from '~/composables/models/type'

const types = ref<TTypeModel[]>([])

function generateTypes(typesData: IType[]) {
  types.value = []
  typesData.forEach((typeData: IType) => {
    types.value.push(typeModel(typeData) as unknown as TTypeModel)
  })
}

export const list = computed(() => {
  const defaultType = types.value.find((type: TTypeModel) => type.name === TYPE_LIST)
  if (!defaultType) {
    throw new Error('Default type not found')
  }

  return defaultType
})

function findByName(name: string) {
  const type = types.value.find((type: TTypeModel) => type.name === name)
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
