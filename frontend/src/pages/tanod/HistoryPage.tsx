import { useState } from 'react'
import {
  CalendarDaysIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import TanodBottomNav from '../../components/TanodBottomNav'
import TanodTopNav from '../../components/TanodTopNav'

// ── Types & data ────────────────────────────────────────────────────────────
type TimeFilter = 'today' | 'week' | 'month'
type HistoryStatus = 'resolved' | 'escalated'

interface HistoryItem {
  id: string
  title: string
  status: HistoryStatus
  date: string
  time: string
  location: string
  footerLabel: string
  footerRed?: boolean
}

const HISTORY: HistoryItem[] = [
  {
    id: 'INC-2024-0975',
    title: 'Physical Altercation',
    status: 'resolved',
    date: '24 SEP 2024',
    time: '14:32',
    location: 'Northeast Perimeter, Gate 4 Sector Alpha. Scene cleared by secondary unit.',
    footerLabel: 'Report Filed',
  },
  {
    id: 'INC-2024-0972',
    title: 'Structural Breach',
    status: 'escalated',
    date: '23 SEP 2024',
    time: '21:15',
    location: 'Warehouse District, Building C. Incident passed to Regional Command. Investigation ongoing.',
    footerLabel: 'Pending Investigation',
    footerRed: true,
  },
  {
    id: 'INC-2024-0968',
    title: 'Noise Complaint',
    status: 'resolved',
    date: '22 SEP 2024',
    time: '02:40',
    location: 'Sector 9 Housing Blocks. Verbal warning issued to residents. No further action.',
    footerLabel: 'Report Filed',
  },
]

// ── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: HistoryStatus }) {
  const isEscalated = status === 'escalated'
  return (
    <span
      className="font-jetbrains text-[10px] font-bold uppercase tracking-[0.08em] text-white shrink-0"
      style={{
        background: isEscalated ? '#b91c1c' : '#1b3022',
        padding: '4px 9px',
        borderRadius: '2px',
      }}
    >
      {isEscalated ? 'Escalated' : 'Resolved'}
    </span>
  )
}

// ── History card ────────────────────────────────────────────────────────────
function HistoryCard({ item }: { item: HistoryItem }) {
  const isEscalated = item.status === 'escalated'
  return (
    <div
      className="bg-white rounded-lg overflow-hidden"
      style={{
        border: '1.5px solid #c3c8c1',
        borderLeft: isEscalated ? '4px solid #b91c1c' : '1.5px solid #c3c8c1',
      }}
    >
      <div className="px-4 sm:px-5 pt-4 pb-4">
        {/* ID + status badge */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="font-jetbrains text-[11px] text-tr-muted tracking-[0.06em]">
            #{item.id}
          </span>
          <StatusBadge status={item.status} />
        </div>

        {/* Title */}
        <p className="font-jetbrains text-[13px] font-bold uppercase tracking-[0.1em] text-tr-on-surface mb-2.5">
          {item.title}
        </p>

        {/* Date + time */}
        <div className="flex items-center gap-2 mb-2">
          <CalendarDaysIcon className="w-4 h-4 text-tr-muted shrink-0" />
          <span className="font-jetbrains text-[11px] text-tr-muted tracking-[0.06em]">
            {item.date} · {item.time}
          </span>
        </div>

        {/* Location / notes */}
        <div className="flex items-start gap-2 mb-3">
          <MapPinIcon className="w-4 h-4 text-tr-muted shrink-0 mt-0.5" />
          <p className="font-hanken text-[13px] text-tr-muted italic leading-relaxed">
            {item.location}
          </p>
        </div>

        <div className="border-t border-tr-divider mb-3" />

        {/* Footer action */}
        <button type="button" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <span
            className="font-jetbrains text-[11px] font-bold uppercase tracking-[0.1em]"
            style={{ color: item.footerRed ? '#b91c1c' : '#1b1c19' }}
          >
            {item.footerLabel}
          </span>
          <ArrowRightIcon
            className="w-3.5 h-3.5"
            style={{ color: item.footerRed ? '#b91c1c' : '#1b1c19' }}
          />
        </button>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function TanodHistoryPage() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('today')
  const [search, setSearch] = useState('')

  const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week',  label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ]

  const filtered = HISTORY.filter((h) => {
    if (!search) return true
    const q = search.toLowerCase()
    return h.id.toLowerCase().includes(q) || h.title.toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen bg-tr-bg flex flex-col lg:pl-64">

      <TanodTopNav title="Field Responder" right="diamond" />

      <div className="flex-1 overflow-y-auto pb-28 lg:pb-8">
        <div className="px-4 sm:px-6 lg:px-8 pt-5 space-y-4 max-w-2xl mx-auto">

          {/* Title */}
          <h1 className="font-hanken font-extrabold text-tr-on-surface text-[26px] sm:text-[28px] leading-tight">
            Incident History
          </h1>

          {/* ── Search ──────────────────────────────────────────── */}
          <div
            className="flex items-center bg-white border border-tr-divider rounded overflow-hidden focus-within:border-tr-on-surface transition-colors"
            style={{ minHeight: '44px' }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH INCIDENTS..."
              className="flex-1 px-4 py-2.5 font-jetbrains text-[12px] text-tr-on-surface placeholder-tr-placeholder outline-none bg-transparent tracking-[0.06em]"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-tr-muted mr-3.5 shrink-0" />
          </div>

          {/* ── Time filter tabs ─────────────────────────────────── */}
          <div className="flex gap-0 rounded overflow-hidden" style={{ border: '1.5px solid #1b1c19' }}>
            {TIME_FILTERS.map(({ key, label }, idx) => {
              const isActive = activeFilter === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveFilter(key)}
                  className="flex-1 font-jetbrains text-[11px] font-bold uppercase tracking-[0.08em] transition-all"
                  style={{
                    padding: '10px 4px',
                    background: isActive ? '#1b3022' : 'transparent',
                    color: isActive ? '#ffffff' : '#1b1c19',
                    borderRight: idx < 2 ? '1.5px solid #1b1c19' : 'none',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* ── History cards ────────────────────────────────────── */}
          {/* Two-column on lg */}
          <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3">
            {filtered.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>

          {/* ── Monthly Snapshot ─────────────────────────────────── */}
          <div
            className="rounded-lg px-4 sm:px-6 py-4 sm:py-5"
            style={{ border: '2px dashed #c3c8c1' }}
          >
            <p className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.12em] text-tr-muted mb-3">
              Monthly Snapshot
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="font-hanken font-extrabold text-tr-on-surface text-[32px] leading-none">42</p>
                <p className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] text-tr-muted mt-1">
                  Incidents
                </p>
              </div>
              <div>
                <p className="font-hanken font-extrabold text-tr-on-surface text-[32px] leading-none">98%</p>
                <p className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] text-tr-muted mt-1">
                  Resolution Rate
                </p>
              </div>
              <div>
                <p className="font-hanken font-extrabold text-tr-on-surface text-[32px] leading-none">4.5<span className="text-[20px]">m</span></p>
                <p className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] text-tr-muted mt-1">
                  Avg Response
                </p>
              </div>
              <div>
                <p className="font-hanken font-extrabold text-tr-on-surface text-[32px] leading-none">12</p>
                <p className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] text-tr-muted mt-1">
                  Escalated
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 rounded-full bg-tr-divider overflow-hidden">
              <div className="h-full rounded-full bg-tr-primary-container" style={{ width: '98%' }} />
            </div>
          </div>

        </div>
      </div>

      <TanodBottomNav active="history" />
    </div>
  )
}
