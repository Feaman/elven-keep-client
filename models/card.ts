import CardService from '@/services/card'
import ApiService from '@/services/api'
import ListItemModel from './list-item'

export interface CardDataObject {
   id?: number
   title?: string | ''
   text?: string | ''
   type?: string | ''
   isCompletedListExpanded?: Boolean
   list?: ListItemModel[]
}

export default class CardModel {
   id?: number
   title: string | ''
   text: string | ''
   list: ListItemModel[] = []
   isCompletedListExpanded: Boolean
   type: string

   static TYPE_LIST = 'list'
   static TYPE_TEXT = 'text'

   constructor (data: CardDataObject) {
     this.id = data.id
     this.title = data.title || ''
     this.text = data.text || ''
     this.type = data.type || CardModel.TYPE_LIST
     this.list = data.list || []
     this.isCompletedListExpanded = data.isCompletedListExpanded || true
   }

   addListItem (listItem: ListItemModel) {
     listItem.card = this
     return CardService.vuex.dispatch('addListItem', listItem)
   }

   save () {
     return CardService.vuex.dispatch('setCard', this)
       .then(() => {
         ApiService.addCard(this)
           .then(data => {
             this.update({ id: data.id })
           })
       })
   }

   update (data: CardDataObject) {
     CardService.vuex.dispatch('updateCard', { card: this, data })
       .then(() => {
         !this.id && this.save()
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
