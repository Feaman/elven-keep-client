export interface IStatus {
  id: number
  title: string
  name: string
}

export default class StatusModel {
  id: number
  title: string
  name: string

  static STATUS_ACTIVE = "active"
  static STATUS_INACTIVE = "inactive"

  constructor (data: IStatus) {
    this.id = data.id
    this.title = data.title
    this.name = data.name
  }
}
