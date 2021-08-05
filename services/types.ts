import BaseService from '~/services/base'
import TypeModel, { IType } from '~/models/type'

export default class TypesService extends BaseService {
  static generateTypes (typesData: IType[]) {
    const types: TypeModel[] = []
    typesData.forEach((typeData: IType) => {
      types.push(new TypeModel(typeData))
    })
    this.vuex.commit('setTypes', types)
  }

  static getDefault () {
    const defaultType = this.vuex.state.types.find((type: TypeModel) => type.name === TypeModel.TYPE_LIST)
    if (!defaultType) {
      return this.error({ statusCode: 500, message: 'Default type not found' })
    }

    return defaultType
  }

  static findByName (name: string) {
    const type = this.vuex.state.types.find((type: TypeModel) => type.name === name)
    if (!type) {
      return this.error({ statusCode: 500, message: `Type '${name}' not found` })
    }

    return type
  }
}
