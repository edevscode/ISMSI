import { useState } from 'react'
import {
  PlusIcon,
  ChevronDownIcon,
  XMarkIcon,
  PencilIcon,
  CheckCircleIcon,
  UserCircleIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline'
import AdminSidebar from '../../components/AdminSidebar'
import AdminTopBar from '../../components/AdminTopBar'

// ── Types & data ────────────────────────────────────────────────────────────

type CaseStatus = 'ONGOING' | 'OPEN' | 'RESOLVED' | 'DISMISSED'

interface Case {
  id: string; caseNum: string; title: string; status: CaseStatus
  complainant: string; respondent: string; dateOpened: string
}

const CASES: Case[] = [
  { id: 'C1', caseNum: '#CAS-2024-0891', title: 'Residential Noise Dispute - Sector 7',    status: 'ONGOING',   complainant: 'Elias Thorne',       respondent: 'Marcus Vane',       dateOpened: '2024-05-12' },
  { id: 'C2', caseNum: '#CAS-2024-0902', title: 'Commercial Zoning Violation - North Hub',  status: 'OPEN',      complainant: 'Urban Planning Dept', respondent: 'Zenith Corp',       dateOpened: '2024-05-14' },
  { id: 'C3', caseNum: '#CAS-2024-0745', title: 'Water Access Allocation - District B',     status: 'RESOLVED',  complainant: 'Sarah Jenkins',       respondent: 'Municipal Utility', dateOpened: '2024-04-20' },
  { id: 'C4', caseNum: '#CAS-2024-1011', title: 'Parking Encroachment - Terrace View',      status: 'DISMISSED', complainant: 'David Wu',            respondent: 'Emily Post',        dateOpened: '2024-05-15' },
]

const STATUS_STYLE: Record<CaseStatus, { bg: string; color: string; border: string }> = {
  ONGOING:   { bg: '#1b3022', color: '#b4cdb8', border: '#364c3c' },
  OPEN:      { bg: 'transparent', color: '#819986', border: '#364c3c' },
  RESOLVED:  { bg: '#252626',  color: '#6b7280', border: '#2a2a2a'  },
  DISMISSED: { bg: '#450a0a',  color: '#fca5a5', border: '#7f1d1d'  },
}

const TIMELINE = [
  { date: 'MAY 15, 2024 – 14:00', title: 'Second Mediation Session', body: 'Parties failed to reach agreement. Rescheduled for arbitration.', done: true  },
  { date: 'MAY 13, 2024 – 09:15', title: 'Site Noise Inspection',    body: 'Officer ID-882 confirmed decibel levels exceeded ordinance by 12dB.', done: false },
  { date: 'MAY 12, 2024 – 11:30', title: 'Case Initialized',         body: '',  done: false },
]

const PARTIES = [
  { name: 'Elias Thorne',     role: 'Complainant / Sector 7 Resident' },
  { name: 'Marcus Vane',      role: 'Respondent / Business Owner'     },
  { name: 'Hon. Sarah Chen',  role: 'Assigned Mediator'               },
]

const CASE_NOTE = `Case involves repeated complaints regarding air conditioning unit noise from the commercial bay adjacent to residential units. Respondent claims unit was serviced, but complainant provides video evidence of high-pitched mechanical whine persisting after 10 PM. Mediation focusing on installation of acoustic dampening panels.`

// ── Style helpers ───────────────────────────────────────────────────────────

const MONO: React.CSSProperties  = { fontFamily: "'JetBrains Mono', monospace" }
const INTER: React.CSSProperties = { fontFamily: 'Inter, sans-serif' }
const LABEL: React.CSSProperties = { ...MONO, fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#8d928c' }

// ── Main page ───────────────────────────────────────────────────────────────

export default function AdminCaseManagementPage() {
  const [selectedId, setSelectedId] = useState('C1')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const selected = CASES.find((c) => c.id === selectedId)!

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#131313', overflow: 'hidden', ...INTER }}>

      <AdminSidebar active="cases" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        <AdminTopBar searchPlaceholder="Search cases, parties, or IDs..." onMenuClick={() => setSidebarOpen(true)} />

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ══ CENTER TABLE ══ */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Queue header */}
            <div style={{ background: '#1f2020', borderBottom: '1px solid #434843', padding: '14px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <div style={{ color: '#e4e2e1', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '3px' }}>
                  Active Case Repository
                </div>
                <div style={{ color: '#8d928c', fontSize: '12.5px' }}>
                  Monitoring 128 active mediation cases within the municipal zone.
                </div>
              </div>
              <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1b3022', border: '1px solid #364c3c', borderRadius: '4px', padding: '8px 14px', color: '#b4cdb8', fontSize: '13px', fontWeight: 600, cursor: 'pointer', flexShrink: 0, ...INTER }}>
                <PlusIcon style={{ width: '14px', height: '14px' }} />
                New Case
              </button>
            </div>

            {/* Filter bar */}
            <div style={{ background: '#1b1c1c', borderBottom: '1px solid #434843', padding: '10px 20px', display: 'flex', gap: '8px', flexShrink: 0 }}>
              {['Status: All', 'Type: Mediation', 'Sort: Newest'].map((label) => (
                <button key={label} type="button" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#252626', border: '1px solid #434843', borderRadius: '4px', padding: '5px 10px', color: '#c3c8c1', fontSize: '12px', cursor: 'pointer', ...MONO, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 700 }}>
                  {label}
                  <ChevronDownIcon style={{ width: '12px', height: '12px', color: '#8d928c' }} />
                </button>
              ))}
            </div>

            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 2.2fr 1fr 1.4fr 1fr', background: '#1b1c1c', borderBottom: '1px solid #434843', padding: '0 20px', flexShrink: 0 }}>
              {['Case Number', 'Title', 'Status', 'Participants', 'Date Opened'].map((col) => (
                <div key={col} style={{ ...LABEL, padding: '10px 0' }}>{col}</div>
              ))}
            </div>

            {/* Rows */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {CASES.map((c) => {
                const isSelected = c.id === selectedId
                const ss = STATUS_STYLE[c.status]
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    style={{
                      display: 'grid', gridTemplateColumns: '1.1fr 2.2fr 1fr 1.4fr 1fr',
                      padding: '0 20px', borderBottom: '1px solid #252626',
                      background: isSelected ? '#232424' : 'transparent',
                      borderLeft: isSelected ? '3px solid #b4cdb8' : '3px solid transparent',
                      cursor: 'pointer', alignItems: 'center', minHeight: '80px',
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* Case # */}
                    <div style={{ ...MONO, fontSize: '11px', fontWeight: 700, color: '#c3cc8c', letterSpacing: '0.04em', lineHeight: 1.55 }}>
                      {c.caseNum.replace('#CAS-2024-', '#CAS-\n2024-')}
                    </div>

                    {/* Title */}
                    <div style={{ color: '#e4e2e1', fontSize: '14px', fontWeight: 600, lineHeight: 1.35, paddingRight: '12px' }}>
                      {c.title}
                    </div>

                    {/* Status */}
                    <div>
                      <span style={{ ...MONO, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {c.status}
                      </span>
                    </div>

                    {/* Participants */}
                    <div style={{ fontSize: '12px', lineHeight: 1.6 }}>
                      <div style={{ color: '#c3c8c1' }}>C: {c.complainant}</div>
                      <div style={{ color: '#8d928c' }}>R: {c.respondent}</div>
                    </div>

                    {/* Date */}
                    <div style={{ ...MONO, color: '#8d928c', fontSize: '12px', letterSpacing: '0.02em' }}>
                      {c.dateOpened}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ══ RIGHT DETAIL PANEL ══ */}
          <aside className="hidden xl:flex" style={{ width: '340px', background: '#1b1c1c', borderLeft: '1px solid #434843', flexDirection: 'column', flexShrink: 0 }}>

            {/* Panel header */}
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #434843', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ ...MONO, fontSize: '10px', fontWeight: 700, color: '#c3cc8c', letterSpacing: '0.06em' }}>
                  {selected.caseNum}
                </span>
                <button type="button" style={{ width: '26px', height: '26px', background: '#252626', border: '1px solid #434843', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <XMarkIcon style={{ width: '13px', height: '13px', color: '#8d928c' }} />
                </button>
              </div>
              <div style={{ color: '#e4e2e1', fontSize: '15px', fontWeight: 700, lineHeight: 1.3, marginBottom: '10px' }}>
                {selected.title}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" style={{ flex: 1, background: '#252626', border: '1px solid #434843', borderRadius: '3px', padding: '6px', color: '#c3c8c1', fontSize: '12px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase', ...MONO }}>
                  Edit Case
                </button>
                <button type="button" style={{ flex: 1, background: '#1b3022', border: '1px solid #364c3c', borderRadius: '3px', padding: '6px', color: '#b4cdb8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase', ...MONO }}>
                  Log Action
                </button>
              </div>
            </div>

            {/* Scrollable */}
            <div style={{ flex: 1, overflowY: 'auto' }}>

              {/* Mediation Timeline */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #252626' }}>
                <div style={{ ...LABEL, marginBottom: '12px' }}>Mediation Timeline</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {TIMELINE.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', paddingBottom: i < TIMELINE.length - 1 ? '14px' : 0 }}>
                      {/* Timeline dot */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        {item.done
                          ? <CheckCircleIcon style={{ width: '16px', height: '16px', color: '#22c55e' }} />
                          : <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${i === 1 ? '#434843' : '#252626'}`, background: '#131313' }} />
                        }
                        {i < TIMELINE.length - 1 && (
                          <div style={{ width: '1px', flex: 1, background: '#252626', marginTop: '3px', minHeight: '20px' }} />
                        )}
                      </div>
                      <div style={{ flex: 1, paddingTop: '1px' }}>
                        <div style={{ ...MONO, fontSize: '10px', color: '#8d928c', letterSpacing: '0.04em', marginBottom: '3px' }}>
                          {item.date}
                        </div>
                        <div style={{ color: item.done ? '#b4cdb8' : '#c3c8c1', fontSize: '13px', fontWeight: 600, marginBottom: item.body ? '4px' : 0 }}>
                          {item.title}
                        </div>
                        {item.body && (
                          <div style={{ color: '#8d928c', fontSize: '11.5px', lineHeight: 1.6, fontStyle: 'italic' }}>
                            {item.body}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Involved Parties */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #252626' }}>
                <div style={{ ...LABEL, marginBottom: '10px' }}>Involved Parties</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {PARTIES.map((p) => (
                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1f2020', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '9px 12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#252626', border: '1px solid #434843', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <UserCircleIcon style={{ width: '20px', height: '20px', color: '#8d928c' }} />
                      </div>
                      <div>
                        <div style={{ color: '#e4e2e1', fontSize: '13px', fontWeight: 600 }}>{p.name}</div>
                        <div style={{ ...MONO, fontSize: '9px', fontWeight: 700, color: '#8d928c', letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: '2px' }}>{p.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Notes */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ ...LABEL }}>Case Notes</div>
                  <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                    <PencilIcon style={{ width: '14px', height: '14px', color: '#8d928c' }} />
                  </button>
                </div>
                <div style={{ background: '#0e0e0e', border: '1px solid #434843', borderRadius: '4px', padding: '12px', color: '#c3c8c1', fontSize: '12.5px', lineHeight: 1.65, minHeight: '120px' }}>
                  {CASE_NOTE}
                </div>
              </div>
            </div>

            {/* Attachment footer */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid #434843', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <PaperClipIcon style={{ width: '18px', height: '18px', color: '#8d928c' }} />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
