import client from './client'

export interface TanodDeployment {
  id: number
  tanod_id: number
  tanod_name: string
  phone_number: string
  zone_label: string | null
  latitude: string
  longitude: string
  availability_status: 'AVAILABLE' | 'RESPONDING' | 'ON_BREAK' | 'OFF_DUTY'
  shift_start: string
  shift_end: string | null
  last_ping_at: string | null
}

export async function listDeployments(): Promise<TanodDeployment[]> {
  const { data } = await client.get<TanodDeployment[]>('/tanods/')
  return data
}

export async function pingLocation(
  latitude: number,
  longitude: number,
  availability_status = 'AVAILABLE',
): Promise<void> {
  await client.post('/tanods/ping/', { latitude, longitude, availability_status })
}

export async function updateTanodStatus(availability_status: string): Promise<void> {
  await client.patch('/tanods/status/', { availability_status })
}
