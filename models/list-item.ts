import CardModel from './card'
import BaseService from '~/services/base'
import ApiService from '~/services/api'

export interface ListItemDataObject {
   id?: number
   text?: string | ''
   card?: CardModel | undefined
   focused?: Boolean
   checked?: Boolean
   completed?: Boolean
}

export default class ListItemModel {
   id?: number
   _id: string
   text?: string | ''
   card: CardModel | undefined
   focused: Boolean
   checked: Boolean
   completed: Boolean

   constructor (data: ListItemDataObject) {
     this.id = data?.id
     this._id = `${(new Date()).getMilliseconds()}-${this.id}`
     this.text = data?.text
     this.card = data?.card
     this.focused = data.focused || false
     this.checked = data.checked || false
     this.completed = data.completed || false
   }

   update (data: ListItemDataObject) {
     return BaseService.vuex.dispatch('updateListItem', { listItem: this, data })
       .then(() => {
         if (data.text) {
           if (this.card && !this.card?.id) {
             this.card.save()
               .then(() => {
                 ApiService.saveListItem(this)
                   .then(data => {
                     BaseService.vuex.dispatch('updateListItem', { listItem: this, data: { id: data.id } })
                   })
               })
           } else {
             ApiService.saveListItem(this)
               .then(data => {
                 BaseService.vuex.dispatch('updateListItem', { listItem: this, data: { id: data.id } })
               })
           }
         }
       })
   }

   remove () {
     BaseService.vuex.dispatch('removeListItem', this)
     return ApiService.removeListItem(this)
   }
}
