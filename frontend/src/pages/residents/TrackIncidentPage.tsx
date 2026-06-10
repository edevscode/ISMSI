import { useState, useEffect } from 'react'
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  ShieldExclamationIcon,
  SpeakerWaveIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import {
  CheckIcon as CheckSolid,
  MapPinIcon as MapPinSolid,
} from '@heroicons/react/24/solid'
import TopNav from '../../components/TopNav'
import BottomNav from '../../components/BottomNav'
import { listIncidents, type Incident } from '../../api/incidents'

// ── Constants ─────────────────────────────────────────────────────────────────

type StepStatus = 'done' | 'active' | 'pending'

const STATUS_ORDER = [
  'REPORTED', 'ASSIGNED', 'RESPONDING', 'ON_SCENE', 'RESOLVED',
] as const

const TIMELINE_LABELS = ['Reported', 'Assigned', 'Responding', 'On Scene', 'Resolved']

const TERMINAL_RESOLVED = new Set(['RESOLVED', 'CLOSED'])
const ACTIVE_STATUSES   = new Set(['REPORTED', 'ASSIGNED', 'RESPONDING', 'ON_SCENE', 'ESCALATED'])

const TYPE_LABEL: Record<string, string> = {
  PHYSICAL_ALTERCATION: 'Physical Altercation',
  THEFT:                'Theft',
  VANDALISM:            'Vandalism',
  DOMESTIC_DISTURBANCE: 'Domestic Disturbance',
  SUSPICIOUS_ACTIVITY:  'Suspicious Activity',
  NOISE_COMPLAINT:      'Noise Complaint',
  OTHER:                'Other',
}

const PRIORITY_STYLE: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH:     'bg-orange-100 text-orange-700',
  MEDIUM:   'bg-yellow-100 text-yellow-700',
  LOW:      'bg-surface-low text-muted',
}

const TYPE_ICON: Record<string, React.ElementType> = {
  PHYSICAL_ALTERCATION: BoltIcon,
  THEFT:                ExclamationTriangleIcon,
  VANDALISM:            ShieldExclamationIcon,
  DOMESTIC_DISTURBANCE: ShieldExclamationIcon,
  SUSPICIOUS_ACTIVITY:  ExclamationCircleIcon,
  NOISE_COMPLAINT:      SpeakerWaveIcon,
  OTHER:                ExclamationCircleIcon,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

function getTimelineSteps(status: string): { label: string; subtitle: string; status: StepStatus }[] {
  const idx = STATUS_ORDER.indexOf(status as typeof STATUS_ORDER[number])
  const resolvedIdx = STATUS_ORDER.length - 1

  return TIMELINE_LABELS.map((label, i) => {
    let stepStatus: StepStatus
    if (TERMINAL_RESOLVED.has(status)) {
      stepStatus = 'done'
    } else if (status === 'ESCALATED' || status === 'REFERRED_TO_POLICE') {
      stepStatus = i < 2 ? 'done' : i === 2 ? 'active' : 'pending'
    } else if (i < idx) {
      stepStatus = 'done'
    } else if (i === idx) {
      stepStatus = i === resolvedIdx ? 'done' : 'active'
    } else {
      stepStatus = 'pending'
    }

    let subtitle = ''
    if (stepStatus === 'done' && label === 'Reported') subtitle = 'Submitted via Citizen Portal'
    if (stepStatus === 'done' && label === 'Assigned') subtitle = 'Tanod dispatched'
    if (stepStatus === 'active') subtitle = 'In progress'
    return { label, subtitle, status: stepStatus }
  })
}

function statusBadge(status: string) {
  if (TERMINAL_RESOLVED.has(status)) return { label: 'Resolved', cls: 'bg-primary text-on-primary' }
  if (status === 'ESCALATED') return { label: 'Escalated', cls: 'bg-red-600 text-white' }
  if (status === 'REFERRED_TO_POLICE') return { label: 'Referred', cls: 'bg-orange-600 text-white' }
  if (status === 'UNABLE_TO_VERIFY') return { label: 'Unverified', cls: 'bg-surface-mid text-muted' }
  return { label: status.replace(/_/g, ' '), cls: 'bg-accent text-on-primary' }
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function TimelineCircle({ status, label }: { status: StepStatus; label: string }) {
  if (status === 'done') return (
    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
      <CheckSolid className="w-3.5 h-3.5 text-on-primary" />
    </div>
  )
  if (status === 'active') return (
    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0">
      <MapPinSolid className="w-3.5 h-3.5 text-on-primary" />
    </div>
  )
  return (
    <div className="w-7 h-7 rounded-full bg-surface border-2 border-divider flex items-center justify-center shrink-0">
      {label === 'Resolved'
        ? <CheckCircleIcon className="w-3.5 h-3.5 text-divider" />
        : <MapPinIcon className="w-3.5 h-3.5 text-divider" />}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TrackIncidentPage() {
  const [search, setSearch]       = useState('')
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    listIncidents()
      .then(setIncidents)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = search.trim()
    ? incidents.filter((i) =>
        i.incident_number.toLowerCase().includes(search.toLowerCase()) ||
        (i.incident_type === 'OTHER' && i.other_incident_type ? i.other_incident_type : (TYPE_LABEL[i.incident_type] ?? '')).toLowerCase().includes(search.toLowerCase())
      )
    : incidents

  // Most recent non-resolved incident for the "active" card
  const active = incidents.find((i) => !TERMINAL_RESOLVED.has(i.status))

  return (
    <div className="min-h-screen bg-background flex flex-col lg:pl-64">
      <TopNav title="My Reports" />

      <div className="flex-1 px-5 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-5">

        {/* Search */}
        <div>
          <label className="block text-[12px] font-semibold text-on-surface uppercase tracking-widest mb-2">
            Search Reports
          </label>
          <div className="flex items-center bg-surface border border-outline rounded-lg overflow-hidden focus-within:border-primary transition-colors">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID or type…"
              className="flex-1 px-4 py-3.5 text-sm text-on-surface placeholder-placeholder outline-none bg-transparent"
            />
            <button type="button" className="m-1.5 bg-accent-dark rounded-lg p-2.5 hover:opacity-90 shrink-0">
              <MagnifyingGlassIcon className="w-5 h-5 text-on-primary" />
            </button>
          </div>
        </div>

        {/* Active incident card */}
        {!loading && active && (
          <div className="bg-surface rounded-2xl shadow-card border-l-4 border-accent">
            <div className="px-5 pt-5 pb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-accent-dark uppercase tracking-widest">
                  Active Incident
                </span>
                {(() => { const b = statusBadge(active.status); return (
                  <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${b.cls}`}>{b.label}</span>
                )})()}
              </div>
              <h2 className="text-[18px] font-bold text-on-surface mb-0.5">
                {active.incident_type === 'OTHER' && active.other_incident_type ? active.other_incident_type : (TYPE_LABEL[active.incident_type] ?? active.incident_type)}
              </h2>
              <p className="text-sm text-muted mb-1">ID: {active.incident_number}</p>
              <p className="text-xs text-muted mb-5">Reported {timeAgo(active.created_at)}</p>

              {/* Priority */}
              <div className="mb-5">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${PRIORITY_STYLE[active.priority] ?? PRIORITY_STYLE.LOW}`}>
                  {active.priority} Priority
                </span>
              </div>

              {/* Timeline */}
              <div>
                {getTimelineSteps(active.status).map((step, idx, arr) => (
                  <div key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <TimelineCircle status={step.status} label={step.label} />
                      {idx < arr.length - 1 && (
                        <div className={`w-0.5 flex-1 min-h-[28px] ${step.status === 'done' ? 'bg-accent' : 'bg-divider'}`} />
                      )}
                    </div>
                    <div className="pb-5 flex-1">
                      <p className={`font-semibold text-[14px] ${
                        step.status === 'done' ? 'text-on-surface' :
                        step.status === 'active' ? 'text-accent-dark' : 'text-divider'
                      }`}>{step.label}</p>
                      {step.subtitle && (
                        <p className={`text-xs mt-0.5 ${step.status === 'active' ? 'text-accent-dark/80' : 'text-muted'}`}>
                          {step.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Location */}
              {(active.resolved_address || (active.latitude && active.longitude)) && (
                <div className="mt-2 flex items-start gap-2 p-3 bg-surface-low rounded-xl">
                  <MapPinIcon className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                  <p className="text-xs text-muted">
                    {active.resolved_address || `${Number(active.latitude).toFixed(5)}, ${Number(active.longitude).toFixed(5)}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* All reports list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[20px] font-bold text-on-surface">All My Reports</h2>
            <span className="text-sm text-muted">{filtered.length} report{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="bg-surface rounded-2xl shadow-card p-6 text-center text-sm text-muted">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface rounded-2xl shadow-card p-6 text-center">
              <p className="text-sm font-semibold text-on-surface mb-1">
                {search ? 'No reports match your search.' : 'No reports submitted yet.'}
              </p>
              <p className="text-xs text-muted">
                {search ? 'Try a different keyword or report ID.' : 'Use the Report Incident button from the dashboard.'}
              </p>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl shadow-card overflow-hidden divide-y divide-divider">
              {filtered.map((inc) => {
                const Icon = TYPE_ICON[inc.incident_type] ?? ExclamationCircleIcon
                const badge = statusBadge(inc.status)
                return (
                  <div key={inc.id} className="flex items-center gap-3 px-4 py-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      ACTIVE_STATUSES.has(inc.status) ? 'bg-primary' : 'bg-surface-low'
                    }`}>
                      <Icon className={`w-5 h-5 ${ACTIVE_STATUSES.has(inc.status) ? 'text-accent' : 'text-muted'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface">
                        {inc.incident_type === 'OTHER' && inc.other_incident_type ? inc.other_incident_type : (TYPE_LABEL[inc.incident_type] ?? inc.incident_type)}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {inc.incident_number} · {timeAgo(inc.created_at)}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0 ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        </div>
      </div>

      <BottomNav active="reports" />
    </div>
  )
}
