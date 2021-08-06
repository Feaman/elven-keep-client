import BaseService from '~/services/base'
import StatusModel, { IStatus } from '~/models/status'

export default class StatusesService extends BaseService {
  static generateStatuses (statusesData: IStatus[]) {
    const statuses: StatusModel[] = []
    statusesData.forEach((statusData: IStatus) => {
      statuses.push(new StatusModel(statusData))
    })
    this.vuex.commit('setStatuses', statuses)
  }

  static getActive (): StatusModel {
    const defaultStatus = this.vuex.state.statuses.find((status: StatusModel) => status.name === StatusModel.STATUS_ACTIVE)
    if (!defaultStatus) {
      return this.error({ statusCode: 500, message: 'Active status not found' })
    }

    return defaultStatus
  }

  static getInActive (): StatusModel {
    const defaultStatus = this.vuex.state.statuses.find((status: StatusModel) => status.name === StatusModel.STATUS_INACTIVE)
    if (!defaultStatus) {
      return this.error({ statusCode: 500, message: 'Inactive status not found' })
    }

    return defaultStatus
  }

  static findByName (name: string) {
    const status = this.vuex.state.statuses.find((status: StatusModel) => status.name === name)
    if (!status) {
      return this.error({ statusCode: 500, message: `Status '${name}' not found` })
    }

    return status
  }

  static findById (statusId: number) {
    const status = this.vuex.state.statuses.find((_status: StatusModel) => _status.id === statusId)
    if (!status) {
      return this.error({ statusCode: 500, message: `Status '${statusId}' not found` })
    }

    return status
  }
}
