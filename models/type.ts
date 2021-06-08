export interface IType {
   id: number
   title: string
   name: string
}

export default class TypeModel {
  id: number
  title: string
  name: string

  static TYPE_LIST = 'list'
  static TYPE_TEXT = 'text'

  constructor (data: IType) {
    this.id = data.id
    this.title = data.title
    this.name = data.name
  }
}
