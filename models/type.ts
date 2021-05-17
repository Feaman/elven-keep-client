export interface TypeDataObject {
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

   constructor (data: TypeDataObject) {
     this.id = data.id
     this.title = data.title
     this.name = data.name
   }
}
