import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPinIcon,
  BoltIcon,
  EyeIcon,
  MapIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  FireIcon,
} from '@heroicons/react/24/outline'
import { BoltIcon as BoltSolid } from '@heroicons/react/24/solid'
import TanodBottomNav from '../../components/TanodBottomNav'
import TanodTopNav from '../../components/TanodTopNav'

// ── Types ──────────────────────────────────────────────────────────────────
type IncidentStatus = 'critical' | 'active' | 'pending' | 'resolved'
type FilterTab = 'all' | IncidentStatus

interface Incident {
  id: string
  title: string
  type: string
  status: IncidentStatus
  location: string
  distance?: string
  time: string
  assignedTo?: 'me' | 'other'
}

// ── Sample data ────────────────────────────────────────────────────────────
const INCIDENTS: Incident[] = [
  {
    id: 'INC-2024-0982',
    title: 'Theft Reported',
    type: 'theft',
    status: 'critical',
    location: 'Santos St. Area',
    distance: '450m',
    time: '10:15 AM',
    assignedTo: 'me',
  },
  {
    id: 'INC-2024-0979',
    title: 'Noise Complaint',
    type: 'disturbance',
    status: 'active',
    location: 'Rizal Ave.',
    distance: '820m',
    time: '09:42 AM',
    assignedTo: 'me',
  },
  {
    id: 'INC-2024-0975',
    title: 'Vandalism',
    type: 'vandalism',
    status: 'pending',
    location: 'Mabini St.',
    distance: '1.2km',
    time: 'Yest. 11:30 PM',
  },
  {
    id: 'INC-2024-0970',
    title: 'Public Disturbance',
    type: 'disturbance',
    status: 'pending',
    location: 'Del Pilar Ave.',
    distance: '2.1km',
    time: 'Yest. 8:15 PM',
  },
  {
    id: 'INC-2024-0965',
    title: 'Streetlight Out',
    type: 'infrastructure',
    status: 'resolved',
    location: 'Luna St.',
    time: '3 days ago',
    assignedTo: 'me',
  },
  {
    id: 'INC-2024-0960',
    title: 'Trespassing',
    type: 'trespassing',
    status: 'resolved',
    location: 'Barangay Hall',
    time: '4 days ago',
  },
]

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'active',   label: 'Active' },
  { key: 'pending',  label: 'Pending' },
  { key: 'resolved', label: 'Resolved' },
]

// ── Sub-components ─────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.12em] text-tr-muted mb-2">
      {children}
    </p>
  )
}

function StatusBadge({ status }: { status: IncidentStatus }) {
  const styles: Record<IncidentStatus, { bg: string; text: string; label: string }> = {
    critical: { bg: '#5f0004', text: '#ff594e', label: 'Critical' },
    active:   { bg: '#1b3022', text: '#ffffff', label: 'Active' },
    pending:  { bg: '#e9e2a1', text: '#4c4817', label: 'Pending' },
    resolved: { bg: '#efeee9', text: '#434843', label: 'Resolved' },
  }
  const s = styles[status]
  return (
    <span
      className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] shrink-0"
      style={{ background: s.bg, color: s.text, padding: '3px 8px', borderRadius: '2px' }}
    >
      {s.label}
    </span>
  )
}

function TypeIcon({ type }: { type: string }) {
  const iconClass = 'w-4 h-4'
  if (type === 'theft' || type === 'trespassing')
    return <ExclamationTriangleIcon className={iconClass} />
  if (type === 'disturbance')
    return <BoltSolid className={iconClass} />
  if (type === 'vandalism')
    return <FireIcon className={iconClass} />
  if (type === 'infrastructure')
    return <ClockIcon className={iconClass} />
  return <BoltIcon className={iconClass} />
}

function IncidentCard({ incident }: { incident: Incident }) {
  const borderColor =
    incident.status === 'critical' ? '#b91c1c'
    : incident.status === 'active'   ? '#1b3022'
    : incident.status === 'pending'  ? '#8b864e'
    : '#c3c8c1'

  const iconBg =
    incident.status === 'critical' ? '#5f0004'
    : incident.status === 'active'   ? '#1b3022'
    : incident.status === 'pending'  ? '#e9e2a1'
    : '#efeee9'

  const iconColor =
    incident.status === 'critical' ? '#ff594e'
    : incident.status === 'active'   ? '#ffffff'
    : incident.status === 'pending'  ? '#4c4817'
    : '#737973'

  const isActionable = incident.status === 'critical' || incident.status === 'active'

  return (
    <div
      className="bg-white rounded-lg overflow-hidden"
      style={{ border: `2px solid ${borderColor}` }}
    >
      <div className="px-4 sm:px-5 pt-4 pb-3">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-9 h-9 rounded flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: iconBg, color: iconColor }}
          >
            <TypeIcon type={incident.type} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="font-jetbrains text-[10px] text-tr-muted tracking-[0.06em]">
                #{incident.id}
              </span>
              {incident.assignedTo === 'me' && (
                <span
                  className="font-jetbrains text-[9px] font-semibold uppercase tracking-[0.1em] shrink-0"
                  style={{ border: '1px solid #8b864e', padding: '1px 5px', borderRadius: '2px', color: '#64602c' }}
                >
                  Assigned to me
                </span>
              )}
            </div>
            <h3 className="font-hanken font-extrabold text-tr-on-surface text-[17px] leading-tight">
              {incident.title}
            </h3>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <MapPinIcon className="w-3.5 h-3.5 text-tr-muted" />
              <span className="font-jetbrains text-[10px] text-tr-muted tracking-[0.04em]">
                {incident.location}
              </span>
            </div>
            {incident.distance && (
              <span className="font-jetbrains text-[10px] text-tr-muted tracking-[0.04em]">
                ↗ {incident.distance}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-jetbrains text-[10px] text-tr-muted">{incident.time}</span>
            <StatusBadge status={incident.status} />
          </div>
        </div>

        {/* Actions */}
        {isActionable && (
          <div className="flex gap-2">
            <Link
              to={`/tanod/incidents/${incident.id}`}
              className="flex-1 bg-tr-primary-container text-tr-on-primary font-hanken font-bold uppercase flex items-center justify-center gap-2 rounded hover:opacity-90 active:opacity-80 transition-opacity"
              style={{ minHeight: '40px', fontSize: '12px', letterSpacing: '0.06em' }}
            >
              <EyeIcon className="w-3.5 h-3.5" />
              View
            </Link>
            <button
              type="button"
              className="flex-1 bg-white border border-tr-on-surface text-tr-on-surface font-hanken font-bold uppercase flex items-center justify-center gap-2 rounded hover:bg-tr-surface transition-colors"
              style={{ minHeight: '40px', fontSize: '12px', letterSpacing: '0.06em' }}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Navigate
            </button>
          </div>
        )}

        {incident.status === 'resolved' && (
          <div className="flex items-center gap-1.5">
            <CheckCircleIcon className="w-3.5 h-3.5 text-tr-muted" />
            <span className="font-jetbrains text-[10px] text-tr-muted tracking-[0.04em]">
              Case closed
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function TanodIncidentsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = INCIDENTS.filter((inc) => {
    const matchesFilter = activeFilter === 'all' || inc.status === activeFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      inc.title.toLowerCase().includes(q) ||
      inc.id.toLowerCase().includes(q) ||
      inc.location.toLowerCase().includes(q)
    return matchesFilter && matchesSearch
  })

  const counts = {
    critical: INCIDENTS.filter((i) => i.status === 'critical').length,
    active:   INCIDENTS.filter((i) => i.status === 'active').length,
    pending:  INCIDENTS.filter((i) => i.status === 'pending').length,
    resolved: INCIDENTS.filter((i) => i.status === 'resolved').length,
  }

  return (
    <div className="min-h-screen bg-tr-bg flex flex-col lg:pl-64">

      <TanodTopNav
        title="Incidents"
        rightSlot={
          <button
            type="button"
            className="flex items-center gap-1.5 border border-tr-divider rounded px-2.5 py-1.5 hover:bg-tr-surface transition-colors"
          >
            <FunnelIcon className="w-4 h-4 text-tr-muted" />
            <span className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.08em] text-tr-muted">
              Filter
            </span>
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto pb-28 lg:pb-8">
        <div className="px-4 sm:px-6 lg:px-8 pt-5 space-y-4 max-w-3xl mx-auto">

          {/* ── Summary stats ────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { key: 'critical', value: counts.critical, label: 'Critical', accent: '#b91c1c', bg: '#5f0004', text: '#ff594e' },
              { key: 'active',   value: counts.active,   label: 'Active',   accent: '#1b3022', bg: '#1b3022', text: '#ffffff' },
              { key: 'pending',  value: counts.pending,  label: 'Pending',  accent: '#8b864e', bg: '#e9e2a1', text: '#4c4817' },
              { key: 'resolved', value: counts.resolved, label: 'Done',     accent: '#c3c8c1', bg: '#efeee9', text: '#434843' },
            ].map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setActiveFilter(s.key as FilterTab)}
                className="rounded-lg px-2 py-3 sm:py-4 flex flex-col items-center gap-1 transition-all"
                style={{
                  background: activeFilter === s.key ? s.bg : '#f5f4ef',
                  border: `1.5px solid ${activeFilter === s.key ? s.accent : '#c3c8c1'}`,
                }}
              >
                <span
                  className="font-hanken font-extrabold text-[22px] sm:text-[26px] leading-none"
                  style={{ color: activeFilter === s.key ? s.text : '#1b1c19' }}
                >
                  {s.value}
                </span>
                <span
                  className="font-jetbrains text-[9px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: activeFilter === s.key ? s.text : '#737973' }}
                >
                  {s.label}
                </span>
              </button>
            ))}
          </div>

          {/* ── Search ───────────────────────────────────────────── */}
          <div
            className="flex items-center bg-white border border-tr-divider rounded overflow-hidden focus-within:border-tr-on-surface transition-colors"
            style={{ minHeight: '44px' }}
          >
            <MagnifyingGlassIcon className="w-4 h-4 text-tr-muted ml-3.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, or location…"
              className="flex-1 px-3 py-2.5 text-sm font-hanken text-tr-on-surface placeholder-tr-placeholder outline-none bg-transparent"
            />
          </div>

          {/* ── Filter tabs ──────────────────────────────────────── */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
            {FILTERS.map(({ key, label }) => {
              const isActive = activeFilter === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveFilter(key)}
                  className="shrink-0 rounded font-jetbrains text-[11px] font-semibold uppercase tracking-[0.1em] transition-all"
                  style={{
                    padding: '6px 14px',
                    background: isActive ? '#1b3022' : '#f5f4ef',
                    color: isActive ? '#ffffff' : '#737973',
                    border: `1.5px solid ${isActive ? '#1b3022' : '#c3c8c1'}`,
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* ── Incidents list ───────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>
                {activeFilter === 'all' ? 'All Incidents' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Incidents`}
              </SectionLabel>
              <span className="font-jetbrains text-[10px] text-tr-muted tracking-[0.06em]">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-tr-surface border border-tr-divider rounded-lg px-4 py-10 flex flex-col items-center gap-3">
                <CheckCircleIcon className="w-10 h-10 text-tr-muted/40" />
                <p className="font-hanken font-semibold text-tr-muted text-[15px]">No incidents found</p>
                <p className="font-jetbrains text-[10px] text-tr-muted/60 uppercase tracking-[0.08em]">
                  Try a different filter or search
                </p>
              </div>
            ) : (
              /* On lg: two-column grid for incident cards */
              <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3">
                {filtered.map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <TanodBottomNav active="incidents" />
    </div>
  )
}
