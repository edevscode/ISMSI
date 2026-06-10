import client from './client'

export interface Notification {
  id: number
  notification_type: string
  title: string
  message: string
  reference_type: string | null
  reference_id: number | null
  is_read: boolean
  created_at: string
}

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await client.get<Notification[]>('/notifications/')
  return data
}

export async function markRead(id: number): Promise<void> {
  await client.post(`/notifications/${id}/read/`)
}

export async function markAllRead(): Promise<void> {
  await client.post('/notifications/read-all/')
}
