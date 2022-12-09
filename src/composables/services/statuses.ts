import { computed, ref } from 'vue'
import statusModel, { IStatus, STATUS_ACTIVE, STATUS_INACTIVE, TStatusModel } from '~/composables/models/status'

export const statuses = ref<TStatusModel[]>([])

export function generateStatuses(statusesData: IStatus[]) {
  statusesData.forEach((statusData: IStatus) => {
    statuses.value.push(statusModel(statusData) as unknown as TStatusModel)
  })
}

export const active = computed(() => {
  const activeStatus = statuses.value.find((status: TStatusModel) => status.name === STATUS_ACTIVE)
  if (!activeStatus) {
    throw new Error('Active status not found')
  }

  return activeStatus
})

export const inactive = computed(() => {
  const inactiveStatus = statuses.value.find((status: TStatusModel) => status.name === STATUS_INACTIVE)
  if (!inactiveStatus) {
    throw new Error('Inactive status not found')
  }

  return inactiveStatus
})

export function findByName(name: string) {
  const status = statuses.value.find((status: TStatusModel) => status.name === name)
  if (!status) {
    throw new Error(`Status '${name}' not found`)
  }

  return status
}

export function findById(statusId: number) {
  const status = statuses.value.find((_status: TStatusModel) => _status.id === statusId)
  if (!status) {
    throw new Error(`Status with id '${statusId}' not found`)
  }

  return status
}

export default {
  statuses,
  active,
  inactive,
  generateStatuses,
  findById,
}
