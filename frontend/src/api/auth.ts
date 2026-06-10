import client from './client'

export interface Session {
  access: string
  refresh: string
  user_id: number
  role: string
  full_name: string
  first_name: string
  last_name: string
  phone_number: string
}

export interface RegisterPayload {
  first_name: string
  middle_name?: string
  last_name: string
  suffix?: string
  phone_number: string
  email?: string
  address?: string
  password: string
}

export async function register(payload: RegisterPayload): Promise<Session> {
  const { data } = await client.post<Session>('/auth/register/', payload)
  localStorage.setItem('ismsi_session', JSON.stringify(data))
  return data
}

export async function login(identifier: string, password: string): Promise<Session> {
  const { data } = await client.post<Session>('/auth/login/', { identifier, password })
  localStorage.setItem('ismsi_session', JSON.stringify(data))
  return data
}

export async function logout(): Promise<void> {
  localStorage.removeItem('ismsi_session')
}

export function getSession(): Session | null {
  const raw = localStorage.getItem('ismsi_session')
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  return getSession() !== null
}
