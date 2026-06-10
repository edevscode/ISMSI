import { useState, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { MapPinIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { getSession } from '../api/auth'
import { pingLocation } from '../api/tanods'

function hasValidSession(role: string): boolean {
  const s = getSession()
  return !!(s?.access && s.role === role)
}

// ── Resident: non-blocking per-session GPS request ────────────────────────────
// Silently asks once per browser session. Stores coords for use in report pages.
function ResidentGpsRequester({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!navigator.geolocation) return
    // Request once per session (sessionStorage is cleared on tab close)
    if (sessionStorage.getItem('ismsi_gps_requested')) return
    sessionStorage.setItem('ismsi_gps_requested', '1')

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        sessionStorage.setItem('ismsi_last_gps', JSON.stringify({
          lat: coords.latitude,
          lon: coords.longitude,
          ts: Date.now(),
        }))
      },
      () => { /* denied — resident can still use app, GPS optional */ },
      { enableHighAccuracy: true, timeout: 8_000 },
    )
  }, [])

  return <>{children}</>
}

// ── Tanod: hard GPS gate — cannot proceed without location ────────────────────

type GpsState = 'requesting' | 'granted' | 'denied'

const MONO: React.CSSProperties  = { fontFamily: "'JetBrains Mono', monospace" }
const HANKEN: React.CSSProperties = { fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }

function TanodGpsGate({ children }: { children: React.ReactNode }) {
  const [state,   setState]   = useState<GpsState>('requesting')
  const [loading, setLoading] = useState(false)

  const request = useCallback(() => {
    if (!navigator.geolocation) { setState('denied'); return }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        pingLocation(pos.coords.latitude, pos.coords.longitude, 'AVAILABLE').catch(() => {})
        setState('granted')
        setLoading(false)
      },
      () => { setState('denied'); setLoading(false) },
      { enableHighAccuracy: true, timeout: 12_000 },
    )
  }, [])

  useEffect(() => { request() }, [request])

  if (state === 'granted') return <>{children}</>

  const isDenied = state === 'denied'

  return (
    <div style={{
      minHeight: '100vh', background: '#faf9f4',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', ...HANKEN,
    }}>
      <div style={{ maxWidth: '340px', width: '100%', textAlign: 'center' }}>

        {/* Icon bubble */}
        <div style={{
          width: '88px', height: '88px', borderRadius: '50%', margin: '0 auto 28px',
          background: isDenied ? '#fee2e2' : '#d0e9d4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isDenied ? '0 0 0 8px rgba(185,28,28,0.08)' : '0 0 0 8px rgba(27,48,34,0.07)',
        }}>
          {isDenied
            ? <ExclamationTriangleIcon style={{ width: '40px', height: '40px', color: '#b91c1c' }} />
            : <MapPinIcon              style={{ width: '40px', height: '40px', color: '#1b3022' }} />
          }
        </div>

        {/* Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <span style={{ ...MONO, fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: isDenied ? '#b91c1c' : '#1b3022', background: isDenied ? '#fee2e2' : '#d0e9d4', padding: '3px 10px', borderRadius: '2px' }}>
            {isDenied ? 'Access Denied' : 'Location Required'}
          </span>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1b1c19', marginBottom: '12px', lineHeight: 1.2 }}>
          {isDenied ? 'GPS Location Blocked' : 'Enable GPS to Continue'}
        </h1>

        {/* Body */}
        <p style={{ fontSize: '15px', color: '#737973', lineHeight: 1.65, marginBottom: '32px' }}>
          {isDenied
            ? <>ISMSI uses your real-time GPS to dispatch you to incidents. <strong style={{ color: '#434843' }}>You cannot use the Field Responder app without location access.</strong></>
            : <>ISMSI needs your GPS location to coordinate incident response and track your position in the field. Tap the button below to activate.</>
          }
        </p>

        {/* Primary button */}
        <button
          type="button"
          disabled={loading}
          onClick={() => { setState('requesting'); request() }}
          style={{
            width: '100%', padding: '15px',
            background: loading ? '#2a4034' : '#1b3022',
            border: '1.5px solid #364c3c', borderRadius: '10px',
            color: '#b4cdb8', fontSize: '16px', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            ...HANKEN,
          }}
        >
          {loading
            ? <><ArrowPathIcon style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} /> Requesting…</>
            : <><MapPinIcon style={{ width: '18px', height: '18px' }} /> {isDenied ? 'Try Again' : 'Enable Location'}</>
          }
        </button>

        {/* Denied instructions */}
        {isDenied && (
          <div style={{ marginTop: '24px', padding: '16px', background: '#f5f4ef', border: '1px solid #c3c8c1', borderRadius: '8px', textAlign: 'left' }}>
            <p style={{ ...MONO, fontSize: '10px', fontWeight: 700, color: '#434843', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
              How to enable
            </p>
            <ol style={{ paddingLeft: '18px', margin: 0, color: '#737973', fontSize: '13px', lineHeight: 1.7 }}>
              <li>Tap the <strong style={{ color: '#434843' }}>lock / info icon</strong> in your browser's address bar</li>
              <li>Find <strong style={{ color: '#434843' }}>Location</strong> and set it to <strong style={{ color: '#434843' }}>Allow</strong></li>
              <li>Reload the page and tap <strong style={{ color: '#434843' }}>Enable Location</strong></li>
            </ol>
          </div>
        )}

        {/* Requesting state sub-text */}
        {!isDenied && !loading && (
          <p style={{ marginTop: '16px', ...MONO, fontSize: '11px', color: '#737973', letterSpacing: '0.04em' }}>
            A location permission dialog will appear in your browser.
          </p>
        )}

        <p style={{ marginTop: '24px', ...MONO, fontSize: '9px', color: '#c3c8c1', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          ISMSI Field Responder · Barangay Bolacan
        </p>
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Route guards ──────────────────────────────────────────────────────────────

export function AdminRoute({ children }: { children: React.ReactNode }) {
  if (!hasValidSession('ADMIN')) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

export function TanodRoute({ children }: { children: React.ReactNode }) {
  if (!hasValidSession('TANOD')) return <Navigate to="/tanod/login" replace />
  return <TanodGpsGate>{children}</TanodGpsGate>
}

export function ResidentRoute({ children }: { children: React.ReactNode }) {
  if (!hasValidSession('RESIDENT')) return <Navigate to="/residents/login" replace />
  return <ResidentGpsRequester>{children}</ResidentGpsRequester>
}

export function GuestRoute({
  children,
  expectedRole,
  authenticatedPath,
}: {
  children: React.ReactNode
  expectedRole: string
  authenticatedPath: string
}) {
  const s = getSession()
  if (s?.access && s.role === expectedRole) {
    return <Navigate to={authenticatedPath} replace />
  }
  return <>{children}</>
}
