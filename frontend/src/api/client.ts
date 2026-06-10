import axios from 'axios'

// In development, Vite proxies /api → http://127.0.0.1:8000.
// In production, set VITE_API_BASE_URL to the backend origin.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

const client = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
})

function readSession(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem('ismsi_session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function redirectToLogin(role?: string) {
  const path = role === 'ADMIN' ? '/admin/login'
             : role === 'TANOD' ? '/tanod/login'
             : '/residents/login'
  localStorage.removeItem('ismsi_session')
  window.location.href = path
}

// Attach JWT access token.
// If the session exists but has no access token (pre-JWT stale session), force re-login.
client.interceptors.request.use((config) => {
  const session = readSession()
  if (session) {
    if (!session.access) {
      redirectToLogin(session.role)
      return Promise.reject(new Error('Stale session — redirecting to login'))
    }
    config.headers['Authorization'] = `Bearer ${session.access}`
  }
  return config
})

// Response interceptor:
//   401 → try silent token refresh, retry once, then redirect to login
//   403 → authenticated but wrong role — clear session and redirect to correct portal
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status: number | undefined = error.response?.status

    if (status === 401 && !original._retry) {
      original._retry = true
      const session = readSession()
      if (session?.refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/api/auth/refresh/`, {
            refresh: session.refresh,
          })
          session.access = data.access
          localStorage.setItem('ismsi_session', JSON.stringify(session))
          original.headers['Authorization'] = `Bearer ${data.access}`
          return client(original)
        } catch {
          // refresh failed — fall through to redirect
        }
      }
      redirectToLogin(readSession()?.role)
      return Promise.reject(error)
    }

    if (status === 403) {
      // Valid JWT but insufficient role — the session may belong to the wrong account.
      // Clear it and send the user to re-login so they can use the correct account.
      redirectToLogin(readSession()?.role)
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

export default client
