export interface IUser {
  id?: number,
  firstName: string,
  secondName: string,
  email: string,
}

export default class UserModel {
  id?: number
  firstName: string
  secondName: string
  email: string

  constructor (data: IUser) {
    this.id = data.id
    this.firstName = data.firstName
    this.secondName = data.secondName
    this.email = data.email
  }

  getFio () {
    return `${this.secondName} ${this.firstName}`
  }

  getInitials () {
    return `${this.secondName.charAt(0).toUpperCase()}${this.firstName.charAt(0).toUpperCase()}`
  }
}
