import { defineStore } from 'pinia'
import { Ref, ref } from 'vue'
import BaseService from '~/services/base'
import useStatusStore, {
  IStatus, StatusModel, STATUS_ACTIVE, STATUS_INACTIVE,
} from './models/status'

export const useStatusesStore = defineStore('statuses', () => {
  const statuses: Ref<StatusModel[]> = ref([])

  function generateStatuses(statusesData: IStatus[]) {
    statusesData.forEach((statusData: IStatus) => {
      statuses.value.push(useStatusStore(statusData))
    })
  }

  function getActive(): StatusModel {
    const defaultStatus = statuses.value.find((status: StatusModel) => status.name === STATUS_ACTIVE)
    if (!defaultStatus) {
      // return BaseService.showError({ statusCode: 500, message: 'Active status not found' })
      throw new Error('Active status not found')
    }

    return defaultStatus
  }

  function getInActive(): StatusModel {
    const defaultStatus = statuses.value.find((status: StatusModel) => status.name === STATUS_INACTIVE)
    if (!defaultStatus) {
      // return BaseService.showError({ statusCode: 500, message: 'Inactive status not found' })
      throw new Error('Inactive status not found')
    }

    return defaultStatus
  }

  function findByName(name: string) {
    const status = statuses.value.find((status: StatusModel) => status.name === name)
    if (!status) {
      return BaseService.showError({ statusCode: 500, message: `Status '${name}' not found` })
    }

    return status
  }

  function findById(statusId: number) {
    const status = statuses.value.find((_status: StatusModel) => _status.id === statusId)
    if (!status) {
      return BaseService.showError({ statusCode: 500, message: `Status '${statusId}' not found` })
    }

    return status
  }

  return {
    statuses, generateStatuses, getActive, getInActive, findByName, findById,
  }
})
