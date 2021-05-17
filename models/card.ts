import CardService from '@/services/card'
import ApiService from '@/services/api'
import TypeService from '@/services/type'
import ListItemModel from './list-item'
import TypeModel from './type'

export interface CardDataObject {
   id?: number
   title?: string | ''
   text?: string | ''
   type?: TypeModel
   typeId?: number
   isCompletedListExpanded?: Boolean
   list?: ListItemModel[]
}

export default class CardModel {
  id?: number
  title: string | ''
  text: string | ''
  list: ListItemModel[] = []
  typeId: number
  type?: TypeModel
  isCompletedListExpanded?: Boolean

  constructor (data: CardDataObject) {
    this.id = data.id
    this.title = data.title || ''
    this.text = data.text || ''
    this.typeId = data.typeId || TypeService.getDefault().id
    this.list = data.list || []
    this.isCompletedListExpanded = data.isCompletedListExpanded || true

    this.handleType()
  }

  static fieldsToSave =['title', 'text', 'isCompletedListExpanded']

  handleType () {
    const type = TypeService.vuex.state.types.find((_type: TypeModel) => _type.id === this.typeId)
    if (!type) {
      return TypeService.error({ statusCode: 500, message: `Type '${this.typeId}' not found` })
    }

    this.type = type
  }

  addListItem (listItem: ListItemModel) {
    listItem.card = this
    return CardService.vuex.dispatch('addListItem', listItem)
  }

  save () {
    if (this.id) {
      ApiService.updateCard(this)
    } else {
      return CardService.vuex.dispatch('setCard', this)
        .then(() => {
          ApiService.addCard(this)
            .then(data => this.update({ id: data.id }))
        })
    }
  }

  update (data: CardDataObject) {
    CardService.vuex.dispatch('updateCard', { card: this, data })
      .then(() => {
        let shouldSave = false
        Object.keys(data).forEach(key => {
          if (CardModel.fieldsToSave.includes(key)) {
            shouldSave = true
          }
        })

        if ((this.text || this.list.length) && shouldSave) {
          this.save()
        }
      })
  }

  delete () {
    CardService.vuex.dispatch('unsetCard', this)
      .then(() => ApiService.removeCard(this))
  }

  setCardToListItems () {
    this.list.forEach(listItem => listItem.update({ card: this }))
  }
}
