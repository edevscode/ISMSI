import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  EyeIcon,
  MapIcon,
  UserGroupIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  SignalIcon,
} from '@heroicons/react/24/outline'
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import TanodBottomNav from '../../components/TanodBottomNav'
import TanodTopNav from '../../components/TanodTopNav'
import { listIncidents, type Incident } from '../../api/incidents'
import { pingLocation, updateTanodStatus } from '../../api/tanods'
import { getSession } from '../../api/auth'

// ── Barangay Bolacan, Bocaue, Bulacan ────────────────────────────────────────
const BRGY_CENTER: [number, number] = [14.7983, 120.9172]

const ACTIVE_STATUSES  = new Set(['REPORTED', 'ASSIGNED', 'RESPONDING', 'ON_SCENE'])
const TODAY_STATUSES   = new Set(['RESOLVED', 'CLOSED', 'REFERRED_TO_POLICE'])

function isToday(iso: string): boolean {
  const d = new Date(iso)
  const n = new Date()
  return d.getFullYear() === n.getFullYear() &&
         d.getMonth()    === n.getMonth()    &&
         d.getDate()     === n.getDate()
}

function fmtType(t: string, other?: string | null): string {
  if (t === 'OTHER' && other) return other
  return t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

// ── Map icon ──────────────────────────────────────────────────────────────────
const incidentPin = L.divIcon({
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  html: `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
    <div class="incident-pulse-ring"></div>
    <div class="incident-pulse-ring incident-pulse-ring2"></div>
    <div style="width:14px;height:14px;border-radius:50%;background:#C0392B;border:2px solid rgba(255,255,255,0.3);box-shadow:0 0 8px #C0392B88;position:relative;z-index:1;"></div>
  </div>`,
})

const myPositionIcon = L.divIcon({
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#1b3022;border:3px solid #b4cdb8;box-shadow:0 0 8px rgba(180,205,184,0.5);"></div>`,
})

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.12em] text-tr-muted mb-2">
      {children}
    </p>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TanodHomePage() {
  const session = getSession()

  const [incidents,   setIncidents]   = useState<Incident[]>([])
  const [myPos,       setMyPos]       = useState<[number, number] | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [statusMsg,   setStatusMsg]   = useState<string | null>(null)

  useEffect(() => {
    listIncidents()
      .then(setIncidents)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos: [number, number] = [coords.latitude, coords.longitude]
        setMyPos(pos)
        pingLocation(coords.latitude, coords.longitude, 'AVAILABLE').catch(() => {})
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }, [])

  const activeIncidents   = incidents.filter(i => ACTIVE_STATUSES.has(i.status))
  const resolvedToday     = incidents.filter(i => TODAY_STATUSES.has(i.status) && isToday(i.updated_at))
  const escalatedToday    = incidents.filter(i => i.status === 'ESCALATED' && isToday(i.updated_at))

  const currentTask = (() => {
    for (const p of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']) {
      const inc = activeIncidents.find(i => i.priority === p)
      if (inc) return inc
    }
    return null
  })()

  const mapCenter: [number, number] = myPos ?? (
    currentTask?.latitude && currentTask?.longitude
      ? [parseFloat(currentTask.latitude), parseFloat(currentTask.longitude)]
      : BRGY_CENTER
  )

  const handleGoOnBreak = async () => {
    try {
      await updateTanodStatus('ON_BREAK')
      setStatusMsg('Status set to On Break')
      setTimeout(() => setStatusMsg(null), 3000)
    } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-tr-bg flex flex-col lg:pl-64">

      <TanodTopNav title="Field Responder" />

      <div className="flex-1 overflow-y-auto pb-28 lg:pb-8">
        <div className="px-4 sm:px-6 lg:px-8 pt-5 space-y-5 max-w-3xl mx-auto">

          {/* ── Duty Status ─────────────────────────────────────────── */}
          <div className="bg-tr-surface border border-tr-divider rounded-lg px-4 py-4 sm:px-6">
            <SectionLabel>Duty Status</SectionLabel>
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-hanken font-extrabold text-tr-on-surface text-[24px] lg:text-[26px] leading-tight">
                {session?.full_name ?? 'Field Responder'}
              </h2>
              <div className="flex items-center gap-1.5 shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-tr-on-surface" />
                <span className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.1em] text-tr-on-surface">
                  Active
                </span>
              </div>
            </div>
            <p className="text-sm text-tr-muted leading-relaxed">
              {activeIncidents.length > 0
                ? `${activeIncidents.length} incident${activeIncidents.length > 1 ? 's' : ''} assigned to you.`
                : 'No active assignments. Standing by.'}
            </p>
            {statusMsg && (
              <p className="text-xs font-jetbrains text-tr-muted mt-2">{statusMsg}</p>
            )}
          </div>

          {/* ── Current Task ────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>Current Task</SectionLabel>
              {currentTask && (
                <span
                  className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] mb-2"
                  style={{
                    color: currentTask.priority === 'CRITICAL' ? '#b91c1c' : currentTask.priority === 'HIGH' ? '#c2410c' : currentTask.priority === 'MEDIUM' ? '#ca8a04' : '#16a34a',
                    border: `1.5px solid ${currentTask.priority === 'CRITICAL' ? '#b91c1c' : currentTask.priority === 'HIGH' ? '#c2410c' : currentTask.priority === 'MEDIUM' ? '#ca8a04' : '#16a34a'}`,
                    padding: '2px 8px', borderRadius: '2px',
                  }}
                >
                  {currentTask.priority}
                </span>
              )}
            </div>

            {loading ? (
              <div className="bg-tr-surface border border-tr-divider rounded-lg px-4 py-5 text-center">
                <p className="font-jetbrains text-[12px] text-tr-muted">Loading assignments…</p>
              </div>
            ) : currentTask ? (
              <div className="bg-white rounded-lg overflow-hidden" style={{ border: '2.5px solid #1b3022' }}>
                <div className="px-4 sm:px-6 pt-4 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-jetbrains text-[11px] text-tr-muted tracking-[0.06em]">
                      #{currentTask.incident_number}
                    </span>
                    {currentTask.resolved_address && (
                      <div className="text-right shrink-0 max-w-[160px]">
                        <p className="font-jetbrains text-[10px] text-tr-muted tracking-[0.08em] uppercase leading-tight">
                          {currentTask.resolved_address}
                        </p>
                      </div>
                    )}
                  </div>

                  <h3 className="font-hanken font-extrabold text-tr-on-surface text-[22px] lg:text-[24px] leading-tight mb-4">
                    {fmtType(currentTask.incident_type, currentTask.other_incident_type)}
                  </h3>

                  {/* On desktop, action buttons side by side */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      to={`/tanod/incidents/${currentTask.id}`}
                      className="flex-1 bg-tr-primary-container text-tr-on-primary font-hanken font-bold uppercase tracking-wide flex items-center justify-center gap-2.5 rounded hover:opacity-90 active:opacity-80 transition-opacity"
                      style={{ minHeight: '48px', fontSize: '13px', letterSpacing: '0.06em' }}
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Incident
                    </Link>
                    {currentTask.latitude && currentTask.longitude && (
                      <button
                        type="button"
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${currentTask.latitude},${currentTask.longitude}`
                          window.open(url, '_blank')
                        }}
                        className="flex-1 bg-white border border-tr-on-surface text-tr-on-surface font-hanken font-bold uppercase tracking-wide flex items-center justify-center gap-2.5 rounded hover:bg-tr-surface transition-colors"
                        style={{ minHeight: '48px', fontSize: '13px', letterSpacing: '0.06em' }}
                      >
                        <MapIcon className="w-4 h-4" />
                        Navigate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-tr-surface border border-tr-divider rounded-lg px-4 py-5 text-center">
                <p className="font-hanken font-semibold text-tr-on-surface text-[15px] mb-1">No Active Tasks</p>
                <p className="font-jetbrains text-[11px] text-tr-muted">Standing by for dispatch.</p>
              </div>
            )}
          </div>

          {/* ── Today's Performance ──────────────────────────────────── */}
          <div>
            <SectionLabel>Today's Performance</SectionLabel>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
              {[
                { value: loading ? '—' : String(resolvedToday.length),  label: 'Resolved',  active: false },
                { value: loading ? '—' : String(activeIncidents.length), label: 'Active',    active: activeIncidents.length > 0 },
                { value: loading ? '—' : String(escalatedToday.length),  label: 'Escalated', active: false },
              ].map(({ value, label, active }) => (
                <div
                  key={label}
                  className={`rounded-lg px-3 py-4 sm:py-5 flex flex-col items-center justify-center gap-1 ${
                    active ? 'bg-tr-primary-container' : 'bg-tr-surface border border-tr-divider'
                  }`}
                >
                  <span className={`font-hanken font-extrabold text-[28px] lg:text-[32px] leading-none ${active ? 'text-tr-on-primary' : 'text-tr-on-surface'}`}>
                    {value}
                  </span>
                  <span className={`font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] ${active ? 'text-tr-on-primary/70' : 'text-tr-muted'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Quick Response ───────────────────────────────────────── */}
          <div>
            <SectionLabel>Quick Response</SectionLabel>
            <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0">
              <Link
                to="/tanod/request-backup"
                className="bg-white border border-tr-divider rounded-lg flex items-center gap-3 px-4 text-left hover:bg-tr-surface transition-colors"
                style={{ minHeight: '56px' }}
              >
                <UserGroupIcon className="w-5 h-5 text-tr-on-surface shrink-0" />
                <span className="flex-1 font-hanken font-semibold text-tr-on-surface text-[15px]">Request Backup</span>
                <ChevronRightIcon className="w-4 h-4 text-tr-muted shrink-0" />
              </Link>

              <button
                type="button"
                onClick={handleGoOnBreak}
                className="w-full bg-white border border-tr-divider rounded-lg flex items-center gap-3 px-4 text-left hover:bg-tr-surface transition-colors"
                style={{ minHeight: '56px' }}
              >
                <PhoneIcon className="w-5 h-5 text-tr-on-surface shrink-0" />
                <span className="flex-1 font-hanken font-semibold text-tr-on-surface text-[15px]">Go On Break</span>
                <ChevronRightIcon className="w-4 h-4 text-tr-muted shrink-0" />
              </button>

              <Link
                to="/tanod/escalate"
                className="rounded-lg flex items-center gap-3 px-4 text-left hover:opacity-90 active:opacity-80 transition-opacity sm:col-span-2"
                style={{ minHeight: '56px', backgroundColor: '#5f0004' }}
              >
                <SignalIcon className="w-5 h-5 shrink-0" style={{ color: '#ff594e' }} />
                <span className="flex-1 font-hanken font-bold text-[15px]" style={{ color: '#ff594e' }}>
                  Emergency Escalation
                </span>
                <ExclamationTriangleIcon className="w-5 h-5 shrink-0" style={{ color: '#ff594e' }} />
              </Link>
            </div>
          </div>

          {/* ── Live Map ─────────────────────────────────────────────── */}
          <div>
            <SectionLabel>Live Map</SectionLabel>
            <div className="rounded-lg overflow-hidden relative h-[220px] sm:h-[260px] lg:h-[300px]" style={{ isolation: 'isolate' }}>
              <MapContainer
                center={mapCenter}
                zoom={16}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                attributionControl={false}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  maxZoom={20}
                />

                {myPos && (
                  <>
                    <Circle
                      center={myPos}
                      radius={80}
                      pathOptions={{ color: '#b4cdb8', fillColor: '#b4cdb8', fillOpacity: 0.1, weight: 1 }}
                    />
                    <Marker position={myPos} icon={myPositionIcon} />
                  </>
                )}

                {activeIncidents
                  .filter(i => i.latitude && i.longitude && !isNaN(parseFloat(i.latitude)))
                  .map(inc => (
                    <Marker
                      key={inc.id}
                      position={[parseFloat(inc.latitude), parseFloat(inc.longitude)]}
                      icon={incidentPin}
                    />
                  ))}
              </MapContainer>

              <div className="absolute bottom-3 right-3" style={{ zIndex: 1000 }}>
                <div className="bg-black/70 px-3 py-1.5 rounded">
                  <span className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                    {myPos ? 'GPS Active' : 'Barangay View'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <TanodBottomNav active="home" />
    </div>
  )
}
