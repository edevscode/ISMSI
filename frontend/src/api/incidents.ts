import client from './client'

export interface Incident {
  id: number
  incident_number: string
  incident_type: string
  other_incident_type: string | null
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: string
  latitude: string
  longitude: string
  location_source: string
  resolved_address: string | null
  ai_summary: string | null
  created_at: string
  updated_at: string
  reporter_name: string
  reports: { id: number; description: string; image_path: string | null; created_at: string }[]
}

export interface SubmitIncidentPayload {
  incident_type: string
  other_incident_type?: string
  description: string
  latitude: number
  longitude: number
  location_source?: 'GPS' | 'MANUAL'
  resolved_address?: string
}

export async function submitIncident(payload: SubmitIncidentPayload): Promise<Incident> {
  const { data } = await client.post<Incident>('/incidents/', payload)
  return data
}

export async function listIncidents(params?: { status?: string; type?: string }): Promise<Incident[]> {
  const { data } = await client.get<Incident[]>('/incidents/', { params })
  return data
}

export async function getIncident(id: number): Promise<Incident> {
  const { data } = await client.get<Incident>(`/incidents/${id}/`)
  return data
}

export async function updateIncidentStatus(id: number, status: string, remarks?: string): Promise<Incident> {
  const { data } = await client.patch<Incident>(`/incidents/${id}/status/`, { status, remarks })
  return data
}

export async function assignTanod(
  incidentId: number,
  tanodId: number,
  role: 'PRIMARY' | 'BACKUP' = 'PRIMARY',
): Promise<void> {
  await client.post(`/incidents/${incidentId}/assign/`, { tanod_id: tanodId, assignment_role: role })
}
