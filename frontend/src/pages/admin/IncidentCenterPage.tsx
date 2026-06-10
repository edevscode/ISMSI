import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  BoltIcon,
  HomeIcon,
  ChevronDownIcon,
  PlusIcon,
  XMarkIcon,
  CalendarDaysIcon,
  CpuChipIcon,
  ShareIcon,
  PaperAirplaneIcon,
  ShieldExclamationIcon,
  SpeakerWaveIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import AdminSidebar from '../../components/AdminSidebar'
import AdminTopBar from '../../components/AdminTopBar'
import { listIncidents, updateIncidentStatus, type Incident as ApiIncident } from '../../api/incidents'

// ── Types ────────────────────────────────────────────────────────────────────

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
type Status   = 'Active' | 'Assigned' | 'Pending'

interface Incident {
  apiId: number
  id: string
  rawStatus: string
  rawType: string
  type: string
  TypeIcon: React.ElementType
  priority: Priority
  location: string
  status: Status
  lat?: string
  lon?: string
  aiSummary?: string
  reporterName?: string
  createdAt: string
  reports: ApiIncident['reports']
}

const typeIconMap: Record<string, React.ElementType> = {
  PHYSICAL_ALTERCATION: BoltIcon,
  THEFT:                ExclamationTriangleIcon,
  VANDALISM:            ShieldExclamationIcon,
  DOMESTIC_DISTURBANCE: HomeIcon,
  SUSPICIOUS_ACTIVITY:  ExclamationCircleIcon,
  NOISE_COMPLAINT:      SpeakerWaveIcon,
  OTHER:                ExclamationCircleIcon,
}

const typeLabel: Record<string, string> = {
  PHYSICAL_ALTERCATION: 'Physical Altercation',
  THEFT:                'Theft',
  VANDALISM:            'Vandalism',
  DOMESTIC_DISTURBANCE: 'Domestic Disturbance',
  SUSPICIOUS_ACTIVITY:  'Suspicious Activity',
  NOISE_COMPLAINT:      'Noise Complaint',
  OTHER:                'Other',
}

function mapApiIncident(inc: ApiIncident): Incident {
  const statusMap: Record<string, Status> = {
    REPORTED: 'Active', ASSIGNED: 'Assigned', RESPONDING: 'Assigned',
    ON_SCENE: 'Assigned', ESCALATED: 'Active', RESOLVED: 'Pending',
    CLOSED: 'Pending', REFERRED_TO_POLICE: 'Pending', UNABLE_TO_VERIFY: 'Pending',
  }
  return {
    apiId:        inc.id,
    id:           inc.incident_number,
    rawStatus:    inc.status,
    rawType:      inc.incident_type,
    type:         inc.incident_type === 'OTHER' && inc.other_incident_type
                    ? inc.other_incident_type
                    : (typeLabel[inc.incident_type] ?? inc.incident_type),
    TypeIcon:     typeIconMap[inc.incident_type] ?? ExclamationTriangleIcon,
    priority:     (inc.priority as Priority) ?? 'LOW',
    location:     inc.resolved_address || `${inc.latitude}, ${inc.longitude}`,
    status:       statusMap[inc.status] ?? 'Active',
    lat:          inc.latitude,
    lon:          inc.longitude,
    aiSummary:    inc.ai_summary ?? undefined,
    reporterName: inc.reporter_name || undefined,
    createdAt:    inc.created_at,
    reports:      inc.reports,
  }
}

const PRIORITY_STYLE: Record<Priority, { bg: string; color: string }> = {
  CRITICAL: { bg: '#7f1d1d', color: '#fca5a5' },
  HIGH:     { bg: '#431a04', color: '#fdba74' },
  MEDIUM:   { bg: '#3d3500', color: '#fde68a' },
  LOW:      { bg: '#14291f', color: '#86efac' },
}

const STATUS_COLOR: Record<Status, string> = {
  Active:   '#22c55e',
  Assigned: '#86efac',
  Pending:  '#6b7280',
}

// ── Style helpers ────────────────────────────────────────────────────────────

const MONO: React.CSSProperties  = { fontFamily: "'JetBrains Mono', monospace" }
const INTER: React.CSSProperties = { fontFamily: 'Inter, sans-serif' }

const LABEL: React.CSSProperties = {
  ...MONO, fontSize: '10px', fontWeight: 700,
  letterSpacing: '0.09em', textTransform: 'uppercase', color: '#8d928c',
}

const incidentPinIcon = L.divIcon({
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: `<div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
    <div class="incident-pulse-ring"></div>
    <div class="incident-pulse-ring incident-pulse-ring2"></div>
    <div style="width:10px;height:10px;border-radius:50%;background:#C0392B;border:1.5px solid rgba(255,255,255,0.3);position:relative;z-index:1;"></div>
  </div>`,
})

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function isToday(iso: string): boolean {
  const d = new Date(iso), n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
}

// ── Filter dropdown ──────────────────────────────────────────────────────────

function FilterDropdown({
  label, options, value, onChange, isOpen, onToggle,
}: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  isOpen: boolean
  onToggle: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onToggle()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [isOpen, onToggle])

  const current = options.find(o => o.value === value)
  const isFiltered = value !== options[0].value

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          ...INTER, display: 'flex', alignItems: 'center', gap: '5px',
          background: isFiltered ? '#1b2e20' : '#252626',
          border: isFiltered ? '1px solid #4a6b50' : '1px solid #434843',
          borderRadius: '4px', padding: '5px 10px',
          color: isFiltered ? '#b4cdb8' : '#c3c8c1',
          fontSize: '12px', cursor: 'pointer',
        }}
      >
        {label}: {current?.label}
        <ChevronDownIcon style={{ width: '12px', height: '12px', color: '#8d928c' }} />
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          background: '#252626', border: '1px solid #434843', borderRadius: '4px',
          zIndex: 200, minWidth: '180px', boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); onToggle() }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px',
                background: opt.value === value ? '#1b2e20' : 'transparent',
                color: opt.value === value ? '#b4cdb8' : '#c3c8c1',
                fontSize: '12px', cursor: 'pointer', border: 'none', ...INTER,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'ALL',      label: 'All' },
  { value: 'Active',   label: 'Active' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'Pending',  label: 'Resolved' },
]

const PRIORITY_OPTIONS = [
  { value: 'ALL',      label: 'All' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH',     label: 'High' },
  { value: 'MEDIUM',   label: 'Medium' },
  { value: 'LOW',      label: 'Low' },
]

const TYPE_OPTIONS = [
  { value: 'ALL',                  label: 'All' },
  { value: 'PHYSICAL_ALTERCATION', label: 'Physical Altercation' },
  { value: 'THEFT',                label: 'Theft' },
  { value: 'VANDALISM',            label: 'Vandalism' },
  { value: 'DOMESTIC_DISTURBANCE', label: 'Domestic Disturbance' },
  { value: 'SUSPICIOUS_ACTIVITY',  label: 'Suspicious Activity' },
  { value: 'NOISE_COMPLAINT',      label: 'Noise Complaint' },
  { value: 'OTHER',                label: 'Other' },
]

export default function AdminIncidentCenterPage() {
  const navigate = useNavigate()

  const [incidents,      setIncidents]      = useState<Incident[]>([])
  const [selectedId,     setSelectedId]     = useState<string | null>(null)
  const [loadingIncidents, setLoadingIncidents] = useState(true)
  const [sidebarOpen,    setSidebarOpen]    = useState(false)
  const [actionLoading,  setActionLoading]  = useState(false)
  const [actionMsg,      setActionMsg]      = useState<string | null>(null)

  const [filterStatus,   setFilterStatus]   = useState('ALL')
  const [filterPriority, setFilterPriority] = useState('ALL')
  const [filterType,     setFilterType]     = useState('ALL')
  const [filterToday,    setFilterToday]    = useState(false)
  const [openFilter,     setOpenFilter]     = useState<string | null>(null)

  const fetchIncidents = useCallback(async () => {
    try {
      const data = await listIncidents()
      const mapped = data.map(mapApiIncident)
      setIncidents(mapped)
      if (mapped.length > 0 && !selectedId) setSelectedId(mapped[0].id)
    } catch {
      // keep previous
    } finally {
      setLoadingIncidents(false)
    }
  }, [selectedId])

  useEffect(() => {
    fetchIncidents()
    const interval = setInterval(fetchIncidents, 20_000)
    return () => clearInterval(interval)
  }, [fetchIncidents])

  const liveCount = incidents.filter(i => i.status === 'Active' || i.status === 'Assigned').length

  const displayed = incidents.filter(inc => {
    if (filterStatus !== 'ALL' && inc.status !== filterStatus) return false
    if (filterPriority !== 'ALL' && inc.priority !== filterPriority) return false
    if (filterType !== 'ALL' && inc.rawType !== filterType) return false
    if (filterToday && !isToday(inc.createdAt)) return false
    return true
  })

  const selected = incidents.find(i => i.id === selectedId)

  const canEscalate = selected &&
    !['ESCALATED', 'RESOLVED', 'CLOSED', 'REFERRED_TO_POLICE', 'UNABLE_TO_VERIFY'].includes(selected.rawStatus)

  async function handleEscalate() {
    if (!selected || !canEscalate || actionLoading) return
    setActionLoading(true)
    setActionMsg(null)
    try {
      await updateIncidentStatus(selected.apiId, 'ESCALATED')
      setActionMsg('Incident escalated.')
      await fetchIncidents()
    } catch {
      setActionMsg('Failed to escalate. Try again.')
    } finally {
      setActionLoading(false)
      setTimeout(() => setActionMsg(null), 3000)
    }
  }

  function handleDispatch() {
    navigate('/admin/dispatch')
  }

  function toggleFilter(name: string) {
    setOpenFilter(prev => prev === name ? null : name)
  }

  // Priority count summary for footer
  const critCount   = incidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'Pending').length
  const highCount   = incidents.filter(i => i.priority === 'HIGH'     && i.status !== 'Pending').length
  const medCount    = incidents.filter(i => i.priority === 'MEDIUM'   && i.status !== 'Pending').length
  const lowCount    = incidents.filter(i => i.priority === 'LOW'      && i.status !== 'Pending').length

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#131313', overflow: 'hidden', ...INTER }}>

      {/* ══ LEFT SIDEBAR ═══════════════════════════════════════════════════ */}
      <AdminSidebar active="incidents" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ══ CENTER ═════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* ── Top bar ── */}
        <AdminTopBar
          searchPlaceholder="Search incidents, assets, or residents..."
          onMenuClick={() => setSidebarOpen(true)}
          rightSlot={
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '4px', padding: '6px 12px' }}>
              <div className="animate-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ ...MONO, fontSize: '11px', fontWeight: 700, color: '#fca5a5', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{liveCount} LIVE INCIDENTS</span>
            </div>
          }
        />

        {/* ── Filter bar ── */}
        <div style={{ background: '#1f2020', borderBottom: '1px solid #434843', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ ...LABEL, color: '#8d928c' }}>Filter By:</span>
            <FilterDropdown
              label="Status"
              options={STATUS_OPTIONS}
              value={filterStatus}
              onChange={setFilterStatus}
              isOpen={openFilter === 'status'}
              onToggle={() => toggleFilter('status')}
            />
            <FilterDropdown
              label="Priority"
              options={PRIORITY_OPTIONS}
              value={filterPriority}
              onChange={setFilterPriority}
              isOpen={openFilter === 'priority'}
              onToggle={() => toggleFilter('priority')}
            />
            <FilterDropdown
              label="Type"
              options={TYPE_OPTIONS}
              value={filterType}
              onChange={setFilterType}
              isOpen={openFilter === 'type'}
              onToggle={() => toggleFilter('type')}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setFilterToday(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: filterToday ? '#1b2e20' : '#252626',
                border: filterToday ? '1px solid #4a6b50' : '1px solid #434843',
                borderRadius: '4px', padding: '5px 12px',
                color: filterToday ? '#b4cdb8' : '#c3c8c1',
                fontSize: '13px', cursor: 'pointer', ...INTER,
              }}
            >
              <CalendarDaysIcon style={{ width: '14px', height: '14px' }} />
              Today
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/dispatch')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1b3022', border: '1px solid #364c3c', borderRadius: '4px', padding: '5px 14px', color: '#b4cdb8', fontSize: '13px', fontWeight: 600, cursor: 'pointer', ...INTER }}
            >
              <PlusIcon style={{ width: '14px', height: '14px' }} />
              NEW INCIDENT
            </button>
          </div>
        </div>

        {/* ── Incident table ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr 1.4fr 1fr', background: '#1b1c1c', borderBottom: '1px solid #434843', padding: '0 20px', flexShrink: 0 }}>
            {['Incident #', 'Type', 'Priority', 'Location', 'Status'].map(col => (
              <div key={col} style={{ ...LABEL, padding: '10px 0' }}>{col}</div>
            ))}
          </div>

          {/* Table rows */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingIncidents && incidents.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8d928c', ...MONO, fontSize: '12px' }}>Loading incidents…</div>
            )}
            {!loadingIncidents && displayed.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8d928c', ...MONO, fontSize: '12px' }}>
                {incidents.length === 0 ? 'No incidents found.' : 'No incidents match the current filters.'}
              </div>
            )}
            {displayed.map(inc => {
              const isSelected = inc.id === selectedId
              const priStyle = PRIORITY_STYLE[inc.priority]
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedId(inc.id)}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr 1.4fr 1fr',
                    padding: '0 20px', borderBottom: '1px solid #252626',
                    background: isSelected ? '#232424' : 'transparent',
                    borderLeft: isSelected ? '3px solid #b4cdb8' : '3px solid transparent',
                    cursor: 'pointer', alignItems: 'center', minHeight: '72px',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ ...MONO, fontSize: '11px', fontWeight: 700, color: '#c3cc8c', letterSpacing: '0.04em', lineHeight: 1.6 }}>
                    {inc.id}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <inc.TypeIcon style={{ width: '16px', height: '16px', color: '#8d928c', flexShrink: 0 }} />
                    <span style={{ color: '#e4e2e1', fontSize: '13px' }}>{inc.type}</span>
                  </div>

                  <div>
                    <span style={{ ...MONO, background: priStyle.bg, color: priStyle.color, fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', letterSpacing: '0.07em' }}>
                      {inc.priority}
                    </span>
                  </div>

                  <div style={{ color: '#c3c8c1', fontSize: '13px' }}>{inc.location}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: STATUS_COLOR[inc.status], flexShrink: 0 }} />
                    <span style={{ color: '#c3c8c1', fontSize: '13px' }}>{inc.status}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Stats footer ── */}
          <div style={{ borderTop: '1px solid #434843', background: '#1b1c1c', padding: '10px 20px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ ...LABEL }}>Active Incidents</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {critCount > 0 && (
                    <span style={{ ...MONO, fontSize: '11px', fontWeight: 700, color: '#fca5a5' }}>
                      {critCount} CRITICAL
                    </span>
                  )}
                  {highCount > 0 && (
                    <span style={{ ...MONO, fontSize: '11px', fontWeight: 700, color: '#fdba74' }}>
                      {highCount} HIGH
                    </span>
                  )}
                  {medCount > 0 && (
                    <span style={{ ...MONO, fontSize: '11px', fontWeight: 700, color: '#fde68a' }}>
                      {medCount} MEDIUM
                    </span>
                  )}
                  {lowCount > 0 && (
                    <span style={{ ...MONO, fontSize: '11px', fontWeight: 700, color: '#86efac' }}>
                      {lowCount} LOW
                    </span>
                  )}
                  {critCount === 0 && highCount === 0 && medCount === 0 && lowCount === 0 && (
                    <span style={{ ...MONO, fontSize: '11px', color: '#8d928c' }}>No active incidents</span>
                  )}
                </div>
              </div>
              <span style={{ ...MONO, fontSize: '10px', color: '#8d928c', letterSpacing: '0.04em' }}>
                {displayed.length} of {incidents.length} incident{incidents.length !== 1 ? 's' : ''} shown
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT DETAIL PANEL ═════════════════════════════════════════════ */}
      <aside className="hidden xl:flex" style={{ width: '340px', background: '#1b1c1c', borderLeft: '1px solid #434843', flexDirection: 'column', flexShrink: 0 }}>

        {/* Panel header */}
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #434843', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#e4e2e1', fontSize: '16px', fontWeight: 600 }}>Incident Details</span>
            {selectedId && (
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                style={{ width: '28px', height: '28px', background: '#252626', border: '1px solid #434843', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <XMarkIcon style={{ width: '14px', height: '14px', color: '#8d928c' }} />
              </button>
            )}
          </div>
          <div style={{ ...MONO, fontSize: '10px', color: '#8d928c', letterSpacing: '0.06em', marginTop: '3px' }}>
            REF: {selectedId ?? '—'}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {!selected ? (
            <div style={{ padding: '40px 16px', textAlign: 'center' }}>
              <span style={{ ...MONO, fontSize: '11px', color: '#8d928c' }}>Select an incident to view details.</span>
            </div>
          ) : (
            <>
              {/* ── Incident summary ── */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #252626' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <selected.TypeIcon style={{ width: '16px', height: '16px', color: '#8d928c', flexShrink: 0 }} />
                  <span style={{ color: '#e4e2e1', fontSize: '15px', fontWeight: 600 }}>{selected.type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    ...MONO, fontSize: '10px', fontWeight: 700, letterSpacing: '0.07em',
                    background: PRIORITY_STYLE[selected.priority].bg,
                    color: PRIORITY_STYLE[selected.priority].color,
                    padding: '3px 9px', borderRadius: '999px',
                  }}>{selected.priority}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: STATUS_COLOR[selected.status] }} />
                    <span style={{ ...MONO, fontSize: '10px', color: '#c3c8c1', letterSpacing: '0.05em' }}>
                      {selected.rawStatus.replace(/_/g, ' ')}
                    </span>
                  </span>
                </div>
                {selected.reporterName && (
                  <div style={{ marginTop: '8px', ...MONO, fontSize: '10px', color: '#8d928c' }}>
                    Reported by {selected.reporterName} · {timeAgo(selected.createdAt)}
                  </div>
                )}
              </div>

              {/* ── AI Synthesis ── */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #252626' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                  <CpuChipIcon style={{ width: '15px', height: '15px', color: '#8d928c', flexShrink: 0 }} />
                  <span style={{ ...MONO, fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#8d928c' }}>
                    AI Incident Synthesis
                  </span>
                </div>
                <p style={{ color: '#c3c8c1', fontSize: '12.5px', lineHeight: 1.65 }}>
                  {selected.aiSummary
                    ?? selected.reports[0]?.description
                    ?? 'No synthesis available.'}
                </p>
              </div>

              {/* ── Precise Location ── */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #252626' }}>
                <span style={{ ...LABEL, display: 'block', marginBottom: '10px' }}>Precise Location</span>
                <div style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden', height: '120px', border: '1px solid #434843', isolation: 'isolate' }}>
                  {selected.lat && selected.lon ? (
                    <MapContainer
                      key={selected.id}
                      center={[parseFloat(selected.lat), parseFloat(selected.lon)]}
                      zoom={17}
                      style={{ width: '100%', height: '100%' }}
                      zoomControl={false}
                      attributionControl={false}
                      scrollWheelZoom={false}
                      dragging={false}
                    >
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" maxZoom={20} />
                      <Marker position={[parseFloat(selected.lat), parseFloat(selected.lon)]} icon={incidentPinIcon} />
                    </MapContainer>
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#1a2818', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ ...MONO, fontSize: '10px', color: '#8d928c' }}>NO GPS DATA</span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <MapPinIcon style={{ width: '13px', height: '13px', color: '#8d928c', flexShrink: 0 }} />
                  <span style={{ ...MONO, fontSize: '11px', color: '#8d928c', letterSpacing: '0.04em' }}>
                    {selected.location}
                  </span>
                </div>
              </div>

              {/* ── Reporter Notes ── */}
              {selected.reports.length > 0 && (
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #252626' }}>
                  <span style={{ ...LABEL, display: 'block', marginBottom: '10px' }}>Reporter Notes</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {selected.reports.map((rep, i) => (
                      <div
                        key={rep.id}
                        style={{
                          paddingTop: i > 0 ? '10px' : 0,
                          borderTop: i > 0 ? '1px solid #252626' : 'none',
                          marginTop: i > 0 ? '10px' : 0,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#e4e2e1', fontSize: '12.5px', fontWeight: 600 }}>
                            {selected.reporterName ?? 'Reporter'}
                          </span>
                          <span style={{ ...MONO, fontSize: '11px', color: '#8d928c', letterSpacing: '0.04em' }}>
                            {timeAgo(rep.created_at)}
                          </span>
                        </div>
                        {rep.description && (
                          <p style={{ color: '#8d928c', fontSize: '12px', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                            "{rep.description}"
                          </p>
                        )}
                        {rep.image_path && (
                          <img
                            src={rep.image_path}
                            alt="Report evidence"
                            style={{ marginTop: '8px', width: '100%', borderRadius: '3px', objectFit: 'cover', maxHeight: '100px' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Status update feedback ── */}
              {actionMsg && (
                <div style={{ padding: '10px 16px', background: '#1b2e20', borderBottom: '1px solid #364c3c' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircleIcon style={{ width: '14px', height: '14px', color: '#b4cdb8' }} />
                    <span style={{ ...MONO, fontSize: '11px', color: '#b4cdb8' }}>{actionMsg}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Action buttons (sticky bottom) ── */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #434843', display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleEscalate}
            disabled={!canEscalate || actionLoading}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              background: 'transparent',
              border: canEscalate ? '1px solid #7f1d1d' : '1px solid #434843',
              borderRadius: '4px', padding: '10px',
              color: canEscalate ? '#fca5a5' : '#6b7280',
              fontSize: '13px', fontWeight: 600,
              cursor: canEscalate && !actionLoading ? 'pointer' : 'not-allowed',
              ...INTER, letterSpacing: '0.04em',
              opacity: actionLoading ? 0.6 : 1,
            }}
          >
            <ShareIcon style={{ width: '15px', height: '15px' }} />
            ESCALATE
          </button>
          <button
            type="button"
            onClick={handleDispatch}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', background: '#1b3022', border: '1px solid #364c3c', borderRadius: '4px', padding: '10px', color: '#b4cdb8', fontSize: '13px', fontWeight: 600, cursor: 'pointer', ...INTER, letterSpacing: '0.04em' }}
          >
            <PaperAirplaneIcon style={{ width: '15px', height: '15px' }} />
            DISPATCH
          </button>
        </div>
      </aside>
    </div>
  )
}
