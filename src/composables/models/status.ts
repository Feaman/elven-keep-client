import { ref, UnwrapRef } from 'vue'

export interface IStatus {
  id: number
  title: string
  name: string
}

export const STATUS_ACTIVE = 'active'
export const STATUS_INACTIVE = 'inactive'

export default function statusModel(statusData: IStatus) {
  const id = ref(statusData.id)
  const title = ref(statusData.title || '')
  const name = ref(statusData.name || '')

  return {
    id, title, name,
  }
}

export type StatusModel = UnwrapRef<ReturnType<typeof statusModel>>
