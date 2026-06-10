import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline'
import AdminSidebar from '../../components/AdminSidebar'
import AdminTopBar from '../../components/AdminTopBar'
import { listIncidents, type Incident } from '../../api/incidents'
import client from '../../api/client'
import { listDeployments, type TanodDeployment } from '../../api/tanods'

// ── Map centre — Barangay Bolacan, Bocaue, Bulacan ───────────────────────────
const BRGY_CENTER: [number, number] = [14.7983, 120.9172]

// ── Priority colours (no blue) ────────────────────────────────────────────────
const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: '#C0392B',
  HIGH:     '#E67E22',
  MEDIUM:   '#eab308',
  LOW:      '#22c55e',
}

const TANOD_STATUS_COLOR: Record<string, string> = {
  AVAILABLE:  '#22c55e',
  RESPONDING: '#E67E22',
  ON_BREAK:   '#eab308',
  OFF_DUTY:   '#6b7280',
}

const RING = (color: string, delay: string) =>
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='22' height='22' style='position:absolute;top:50%;left:50%;margin-top:-11px;margin-left:-11px;animation:radar-wave 2.4s ease-out infinite;animation-delay:${delay};pointer-events:none;overflow:visible;'>
    <path fill='none' stroke='${color}' stroke-width='1.5' stroke-linejoin='round' d='M12 3 2.5 20.5h19Z'/>
  </svg>`

function incidentIcon(priority: string): L.DivIcon {
  const color = PRIORITY_COLOR[priority] ?? '#8d928c'
  return L.divIcon({
    className: '',
    iconSize:   [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;overflow:visible;">
      ${RING(color, '0s')}${RING(color, '0.8s')}${RING(color, '1.6s')}
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='22' height='22' style='position:relative;z-index:1;filter:drop-shadow(0 0 4px ${color}99)'>
        <path fill='${color}' stroke='${color}' stroke-width='0.5' d='M12 3 2.5 20.5h19Z' opacity='0.95'/>
        <line x1='12' y1='9' x2='12' y2='14.5' stroke='rgba(0,0,0,0.6)' stroke-width='1.8' stroke-linecap='round'/>
        <circle cx='12' cy='16.5' r='0.9' fill='rgba(0,0,0,0.6)'/>
      </svg>
    </div>`,
  })
}

function tanodIcon(status: string): L.DivIcon {
  const color = TANOD_STATUS_COLOR[status] ?? '#22c55e'
  return L.divIcon({
    className: '',
    iconSize:   [26, 26],
    iconAnchor: [13, 13],
    html: `<div style="width:26px;height:26px;border-radius:4px;background:#1b1c1c;border:2px solid ${color};display:flex;align-items:center;justify-content:center;box-shadow:0 0 6px ${color}55;">
      <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='${color}' stroke-width='2'>
        <path stroke-linecap='round' stroke-linejoin='round' d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'/>
      </svg>
    </div>`,
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACTIVE_STATUSES  = new Set(['REPORTED', 'ASSIGNED', 'RESPONDING', 'ON_SCENE', 'ESCALATED'])
const ONGOING_STATUSES = new Set(['ASSIGNED', 'RESPONDING', 'ON_SCENE'])

const STATUS_LABEL: Record<string, string> = {
  REPORTED: 'Reported', ASSIGNED: 'Assigned', RESPONDING: 'Responding',
  ON_SCENE: 'On Scene', ESCALATED: 'Escalated', RESOLVED: 'Resolved',
  CLOSED: 'Closed', REFERRED_TO_POLICE: 'Referred', UNABLE_TO_VERIFY: 'Unverified',
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'Just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function elapsedStr(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `T+ ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

function liveClock(): string {
  return new Date().toLocaleString('en-PH', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).replace(',', ' |')
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const MONO: React.CSSProperties  = { fontFamily: "'JetBrains Mono', monospace" }
const INTER: React.CSSProperties = { fontFamily: 'Inter, sans-serif' }

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [incidents,   setIncidents]   = useState<Incident[]>([])
  const [tanodCount,  setTanodCount]  = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [clock,       setClock]       = useState(liveClock)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tanods,      setTanods]      = useState<TanodDeployment[]>([])

  // Live 1-second clock
  useEffect(() => {
    const t = setInterval(() => setClock(liveClock()), 1000)
    return () => clearInterval(t)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const [incData, tanodRes, deployments] = await Promise.all([
        listIncidents(),
        client.get<{ id: number }[]>('/auth/accounts/?role=TANOD'),
        listDeployments(),
      ])
      setIncidents(incData)
      setTanodCount(tanodRes.data.length)
      const seen = new Map<number, TanodDeployment>()
      for (const t of deployments) {
        const existing = seen.get(t.tanod_id)
        if (!existing || t.id > existing.id) seen.set(t.tanod_id, t)
      }
      setTanods([...seen.values()])
    } catch {
      // keep previous state on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Poll every 30 s
  useEffect(() => {
    const t = setInterval(fetchData, 30_000)
    return () => clearInterval(t)
  }, [fetchData])

  // ── Derived values ──────────────────────────────────────────────────────────

  const activeIncidents = incidents.filter(i => ACTIVE_STATUSES.has(i.status))
  const ongoingCases    = incidents.filter(i => ONGOING_STATUSES.has(i.status))
  const pendingReports  = incidents.filter(i => i.status === 'REPORTED')

  const feedItems = [...incidents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  const PRIORITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
  const priorityQueue = activeIncidents
    .sort((a, b) => {
      const diff = (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)
      if (diff !== 0) return diff
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })
    .slice(0, 4)

  const mapMarkers = activeIncidents.filter(
    i => i.latitude && i.longitude &&
         !isNaN(parseFloat(i.latitude)) &&
         !isNaN(parseFloat(i.longitude)),
  )

  const mapTanods = tanods.filter(
    t => t.latitude && t.longitude &&
         !isNaN(parseFloat(t.latitude)) &&
         !isNaN(parseFloat(t.longitude)),
  )

  const pad = (n: number) => String(n).padStart(2, '0')

  const STATS = [
    { label: 'Active Incidents', value: loading ? '—' : pad(activeIncidents.length), color: '#ef4444', Icon: ExclamationTriangleIcon,   alert: activeIncidents.length > 0 },
    { label: 'Ongoing Cases',    value: loading ? '—' : pad(ongoingCases.length),    color: '#f97316', Icon: ClipboardDocumentListIcon, alert: false },
    { label: 'Tanods Active',    value: loading ? '—' : pad(tanodCount),             color: '#b4cdb8', Icon: ShieldCheckIcon,           alert: false },
    { label: 'Pending Reports',  value: loading ? '—' : pad(pendingReports.length),  color: '#8d928c', Icon: DocumentTextIcon,          alert: pendingReports.length > 0 },
  ]

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#131313', overflow: 'hidden', ...INTER }}>

      <AdminSidebar active="dashboard" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ══ CENTER ════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        <AdminTopBar
          searchPlaceholder="Search Incidents, Tanods, or IDs..."
          onMenuClick={() => setSidebarOpen(true)}
          midSlot={
            <div style={{ borderLeft: '1px solid #434843', paddingLeft: '14px' }}>
              <span style={{ ...MONO, fontSize: '12px', color: '#8d928c', letterSpacing: '0.04em' }}>
                {clock}
              </span>
            </div>
          }
        />

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', borderBottom: '1px solid #434843', flexShrink: 0, overflowX: 'auto' }}>
          {STATS.map(({ label, value, color, Icon, alert }, i) => (
            <div
              key={label}
              style={{
                padding: '14px 20px 12px',
                borderRight: i < 3 ? '1px solid #434843' : 'none',
                background: '#1f2020',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                minWidth: '160px',
              }}
            >
              <div>
                <div style={{ ...MONO, fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#8d928c', marginBottom: '5px' }}>
                  {label}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                  <span style={{ ...MONO, fontSize: '30px', fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
                  {alert && <span style={{ color, fontSize: '22px', fontWeight: 700, lineHeight: 1 }}>*</span>}
                </div>
              </div>
              <Icon style={{ width: '26px', height: '26px', color, opacity: 0.55, flexShrink: 0 }} />
            </div>
          ))}
        </div>

        {/* ── Live map — Barangay Bolacan, Bocaue, Bulacan ─────────────────── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
          <MapContainer
            center={BRGY_CENTER}
            zoom={15}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={20}
            />

            {mapTanods.map(t => (
              <Marker
                key={`tanod-${t.tanod_id}`}
                position={[parseFloat(t.latitude), parseFloat(t.longitude)]}
                icon={tanodIcon(t.availability_status)}
                zIndexOffset={1500}
              >
                <Tooltip direction="top" offset={[0, -13]}>
                  <div style={{ ...MONO, fontSize: '11px' }}>
                    <div style={{ color: TANOD_STATUS_COLOR[t.availability_status] ?? '#22c55e', fontWeight: 700 }}>
                      {t.tanod_name}
                    </div>
                    <div style={{ color: '#8d928c', fontSize: '10px' }}>
                      {t.availability_status.replace(/_/g, ' ')} · {t.zone_label ?? 'No zone'}
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            ))}

            {mapMarkers.map(inc => (
              <Marker
                key={inc.id}
                position={[parseFloat(inc.latitude), parseFloat(inc.longitude)]}
                icon={incidentIcon(inc.priority)}
                zIndexOffset={inc.priority === 'CRITICAL' ? 1000 : 0}
              >
                <Tooltip direction="top" offset={[0, -14]}>
                  <div style={{ ...MONO, fontSize: '11px' }}>
                    <div style={{ color: PRIORITY_COLOR[inc.priority] ?? '#8d928c', fontWeight: 700 }}>
                      {inc.priority} — {inc.incident_number}
                    </div>
                    <div style={{ color: '#8d928c', fontSize: '10px' }}>
                      {inc.resolved_address ?? `${parseFloat(inc.latitude).toFixed(4)}, ${parseFloat(inc.longitude).toFixed(4)}`}
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>

          {/* Location label */}
          <div style={{ position: 'absolute', bottom: '16px', left: '16px', zIndex: 900, background: 'rgba(27,28,28,0.9)', border: '1px solid #434843', borderRadius: '4px', padding: '6px 12px' }}>
            <span style={{ ...MONO, fontSize: '10px', color: '#b4cdb8', letterSpacing: '0.08em', fontWeight: 700 }}>
              BRGY. BOLACAN · BOCAUE, BULACAN
            </span>
          </div>

          {/* Alert button */}
          <button
            type="button"
            aria-label="Alerts"
            style={{ position: 'absolute', right: '16px', bottom: '16px', zIndex: 900, width: '52px', height: '52px', background: 'rgba(31,32,32,0.9)', border: '1px solid #434843', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <BellAlertIcon style={{ width: '22px', height: '22px', color: '#c3c8c1' }} />
          </button>
        </div>
      </div>

      {/* ══ RIGHT PANEL ════════════════════════════════════════════════════════ */}
      <aside className="hidden xl:flex" style={{ width: '340px', background: '#1b1c1c', borderLeft: '1px solid #434843', flexDirection: 'column', flexShrink: 0 }}>

        {/* Feed header */}
        <div style={{ height: '64px', borderBottom: '1px solid #434843', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0 }}>
          <span style={{ ...MONO, fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#c3c8c1' }}>
            Live Incident Feed
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ ...MONO, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#22c55e' }}>
              Live
            </span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* Feed items */}
          {loading ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', ...MONO, fontSize: '11px', color: '#8d928c' }}>Loading feed…</div>
          ) : feedItems.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', ...MONO, fontSize: '11px', color: '#8d928c' }}>No incidents yet.</div>
          ) : feedItems.map(inc => {
            const isNew = Date.now() - new Date(inc.created_at).getTime() < 5 * 60 * 1000
            const incColor = PRIORITY_COLOR[inc.priority] ?? '#8d928c'
            return (
              <div key={inc.id} style={{ padding: '13px 16px', borderBottom: '1px solid #252626' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ ...MONO, fontSize: '11px', color: '#c3cc8c', letterSpacing: '0.04em' }}>
                    {timeAgo(inc.created_at)}
                  </span>
                  {isNew && (
                    <span style={{ ...MONO, background: '#1b3022', color: '#b4cdb8', fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '2px', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                      NEW
                    </span>
                  )}
                </div>
                <div style={{ color: '#e4e2e1', fontSize: '13px', fontWeight: 600, marginBottom: '4px', lineHeight: 1.35 }}>
                  {inc.incident_number} — {(inc.incident_type === 'OTHER' && inc.other_incident_type ? inc.other_incident_type : inc.incident_type.replace(/_/g, ' '))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ ...MONO, fontSize: '9px', color: incColor, fontWeight: 700, letterSpacing: '0.07em' }}>{inc.priority}</span>
                  <span style={{ color: '#434843' }}>·</span>
                  <span style={{ color: '#8d928c', fontSize: '12px' }}>{STATUS_LABEL[inc.status] ?? inc.status}</span>
                </div>
              </div>
            )
          })}

          {/* Priority queue */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px', borderBottom: '1px solid #252626', marginTop: '4px' }}>
            <span style={{ ...MONO, fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#c3c8c1' }}>
              Priority Queue
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '16px', textAlign: 'center', ...MONO, fontSize: '11px', color: '#8d928c' }}>Loading…</div>
          ) : priorityQueue.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', ...MONO, fontSize: '11px', color: '#8d928c' }}>
              No active incidents.
            </div>
          ) : priorityQueue.map(inc => {
            const isCritical = inc.priority === 'CRITICAL'
            const priorityTextColor = PRIORITY_COLOR[inc.priority] ?? '#8d928c'
            return (
              <div
                key={inc.id}
                style={{
                  margin: '8px',
                  padding: '11px 13px',
                  background: isCritical ? '#2d0a0a' : '#1f2020',
                  border: `1px solid ${isCritical ? '#5f1a1a' : '#434843'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ ...MONO, fontSize: '11px', fontWeight: 700, color: '#c3cc8c', letterSpacing: '0.04em' }}>
                    {inc.incident_number}
                  </span>
                  <span style={{ ...MONO, fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: priorityTextColor }}>
                    {inc.priority}
                  </span>
                </div>
                <div style={{ color: isCritical ? '#e4e2e1' : '#c3cc8c', fontSize: '14px', fontWeight: 600, marginBottom: '8px', lineHeight: 1.3 }}>
                  {inc.incident_type === 'OTHER' && inc.other_incident_type ? inc.other_incident_type : inc.incident_type.replace(/_/g, ' ')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ ...MONO, fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '2px', background: '#2a2a2a', color: '#c3c8c1', letterSpacing: '0.04em' }}>
                    {STATUS_LABEL[inc.status] ?? inc.status}
                  </span>
                  <span style={{ ...MONO, fontSize: '11px', color: '#8d928c', letterSpacing: '0.04em' }}>
                    {elapsedStr(inc.created_at)}
                  </span>
                </div>
              </div>
            )
          })}

        </div>
      </aside>
    </div>
  )
}
