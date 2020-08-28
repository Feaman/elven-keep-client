import CardService from '~/services/card'

export default class CardModel {
  constructor (
    public id: number,
    public title: string,
    public text: string
  ) {}

  save (title: string, text: string) {
    CardService.save(this, title, text)
  }

  delete () {
    CardService.delete(this)
  }
}
