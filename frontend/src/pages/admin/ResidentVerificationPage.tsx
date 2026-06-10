import { useState } from 'react'
import {
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ScaleIcon,
  CircleStackIcon,
  EllipsisHorizontalIcon,
  Squares2X2Icon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import AdminSidebar from '../../components/AdminSidebar'
import AdminTopBar from '../../components/AdminTopBar'

// ── Types & data ────────────────────────────────────────────────────────────

type DocStatus = 'IN REVIEW' | 'PENDING' | 'PROCESSED'
type Tab       = 'all' | 'pending' | 'completed'

interface VerificationRequest {
  id: string
  residentName: string
  residentId: string
  docType: string
  date: string
  status: DocStatus
}

const REQUESTS: VerificationRequest[] = [
  { id: 'DR-2024-0891', residentName: 'Juan Dela Cruz', residentId: '08-1123-A', docType: 'Barangay Clearance',       date: 'Oct 24, 09:12 AM', status: 'IN REVIEW' },
  { id: 'DR-2024-0890', residentName: 'Maria Santos',   residentId: '08-1156-B', docType: 'Certificate of Indigency', date: 'Oct 24, 08:45 AM', status: 'PENDING'   },
  { id: 'DR-2024-0889', residentName: 'Ricardo Gomez',  residentId: '08-0922-C', docType: 'Permit to Operate',        date: 'Oct 23, 11:30 PM', status: 'PENDING'   },
  { id: 'DR-2024-0888', residentName: 'Elena Reyes',    residentId: '08-1100-D', docType: 'Barangay Clearance',       date: 'Oct 23, 05:22 PM', status: 'PROCESSED' },
]

const STATUS_CONFIG: Record<DocStatus, { color: string; dot: boolean }> = {
  'IN REVIEW': { color: '#22c55e', dot: true  },
  'PENDING':   { color: '#8d928c', dot: false },
  'PROCESSED': { color: '#434843', dot: false },
}

const VERIFICATION_FIELDS = [
  { label: 'Submission Date',      value: '2024-10-24  |  09:12:44', checked: false },
  { label: 'Liveness Check',       value: 'PASSED',                  checked: true  },
  { label: 'Address Verification', value: 'MATCHED',                 checked: true  },
]

// ── Style helpers ───────────────────────────────────────────────────────────

const MONO: React.CSSProperties  = { fontFamily: "'JetBrains Mono', monospace" }
const INTER: React.CSSProperties = { fontFamily: 'Inter, sans-serif' }
const LABEL: React.CSSProperties = { ...MONO, fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#8d928c' }

// ── Main page ───────────────────────────────────────────────────────────────

export default function AdminResidentVerificationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pending')
  const [selectedId, setSelectedId] = useState('DR-2024-0891')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const selected = REQUESTS.find((r) => r.id === selectedId)!

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#131313', overflow: 'hidden', ...INTER }}>

      {/* ══ LEFT SIDEBAR ═══════════════════════════════════════════════════ */}
      <AdminSidebar active="verification" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ══ CENTER ═════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        <AdminTopBar searchPlaceholder="Search resident record..." onMenuClick={() => setSidebarOpen(true)} />

        {/* ── Queue header ── */}
        <div style={{ background: '#1f2020', borderBottom: '1px solid #434843', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardDocumentListIcon style={{ width: '22px', height: '22px', color: '#b4cdb8' }} />
            <span style={{ color: '#e4e2e1', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Requests Queue
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {(['all', 'pending', 'completed'] as Tab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  ...MONO, fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', padding: '5px 12px', borderRadius: '3px', cursor: 'pointer',
                  background: activeTab === tab ? '#1b3022' : '#252626',
                  color:      activeTab === tab ? '#b4cdb8' : '#8d928c',
                  border:     `1px solid ${activeTab === tab ? '#364c3c' : '#434843'}`,
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1.5fr 1.2fr 1fr', background: '#1b1c1c', borderBottom: '1px solid #434843', padding: '0 20px', flexShrink: 0 }}>
            {['REQ #', 'RESIDENT', 'DOC TYPE', 'DATE', 'STATUS'].map((col) => (
              <div key={col} style={{ ...LABEL, padding: '10px 0' }}>{col}</div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {REQUESTS.map((req) => {
              const isSelected = req.id === selectedId
              const { color, dot } = STATUS_CONFIG[req.status]
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedId(req.id)}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 1.6fr 1.5fr 1.2fr 1fr',
                    padding: '0 20px', borderBottom: '1px solid #252626',
                    background: isSelected ? '#232424' : 'transparent',
                    borderLeft: isSelected ? '3px solid #b4cdb8' : '3px solid transparent',
                    cursor: 'pointer', alignItems: 'center', minHeight: '72px',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* REQ # */}
                  <div style={{ ...MONO, fontSize: '11px', fontWeight: 700, color: '#c3cc8c', letterSpacing: '0.04em', lineHeight: 1.55 }}>
                    {req.id.replace('DR-2024-', 'DR-\n2024-')}
                  </div>

                  {/* Resident */}
                  <div>
                    <div style={{ color: '#e4e2e1', fontSize: '14px', fontWeight: 700, lineHeight: 1.3 }}>
                      {req.residentName}
                    </div>
                    <div style={{ ...MONO, fontSize: '11px', color: '#8d928c', letterSpacing: '0.04em', marginTop: '3px' }}>
                      ID: {req.residentId}
                    </div>
                  </div>

                  {/* Doc type */}
                  <div>
                    <span style={{
                      display: 'inline-block',
                      background: '#1b3022', color: '#819986',
                      fontSize: '11px', padding: '3px 9px',
                      borderRadius: '3px', border: '1px solid #2e4535',
                      lineHeight: 1.4, maxWidth: '130px',
                    }}>
                      {req.docType}
                    </span>
                  </div>

                  {/* Date */}
                  <div style={{ ...MONO, color: '#8d928c', fontSize: '11px', letterSpacing: '0.02em', lineHeight: 1.6 }}>
                    {req.date.replace(', ', ',\n')}
                  </div>

                  {/* Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {dot && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />}
                    <span style={{ ...MONO, fontSize: '11px', fontWeight: 700, color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {req.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Review Framework ── */}
        <div style={{ background: '#0f160f', borderTop: '1px solid #2a3828', padding: '14px 20px', flexShrink: 0 }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ScaleIcon style={{ width: '18px', height: '18px', color: '#b4cdb8' }} />
              <span style={{ color: '#e4e2e1', fontSize: '16px', fontWeight: 700 }}>Review Framework</span>
            </div>
            <span style={{ ...MONO, background: '#1b3022', color: '#b4cdb8', border: '1px solid #364c3c', borderRadius: '999px', fontSize: '10px', fontWeight: 700, padding: '3px 10px', letterSpacing: '0.07em' }}>
              ✓ No Active Case
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={{ background: '#1b1c1c', border: '1px solid #2a3828', borderRadius: '4px', padding: '12px 14px' }}>
              <div style={{ ...LABEL, marginBottom: '8px' }}>Automated Check</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircleIcon style={{ width: '18px', height: '18px', color: '#22c55e', flexShrink: 0 }} />
                <span style={{ color: '#e4e2e1', fontSize: '13px', fontWeight: 600 }}>Criminal Record Cleared</span>
              </div>
            </div>

            <div style={{ background: '#1b1c1c', border: '1px solid #2a3828', borderRadius: '4px', padding: '12px 14px' }}>
              <div style={{ ...LABEL, marginBottom: '8px' }}>Municipal DB</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CircleStackIcon style={{ width: '18px', height: '18px', color: '#8d928c', flexShrink: 0 }} />
                <span style={{ color: '#e4e2e1', fontSize: '13px', fontWeight: 600 }}>Record Found: District 4</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                background: '#c3cc8c', color: '#2d3404', border: 'none', borderRadius: '4px',
                padding: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                letterSpacing: '0.05em', ...INTER,
              }}
            >
              <ClipboardDocumentListIcon style={{ width: '17px', height: '17px' }} />
              GENERATE DOCUMENT PREVIEW
            </button>
            <button
              type="button"
              style={{ width: '44px', flexShrink: 0, background: '#252626', border: '1px solid #434843', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <EllipsisHorizontalIcon style={{ width: '18px', height: '18px', color: '#8d928c' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL — VERIFICATION DESK ════════════════════════════════ */}
      <aside className="hidden xl:flex" style={{ width: '340px', background: '#1b1c1c', borderLeft: '1px solid #434843', flexDirection: 'column', flexShrink: 0, position: 'relative' }}>

        {/* Panel header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #434843', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <ShieldCheckIcon style={{ width: '18px', height: '18px', color: '#b4cdb8' }} />
          <span style={{ color: '#e4e2e1', fontSize: '16px', fontWeight: 700 }}>Verification Desk</span>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '72px' }}>

          {/* ── Resident card ── */}
          <div style={{ padding: '16px', borderBottom: '1px solid #252626', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            {/* Portrait placeholder */}
            <div style={{ width: '76px', height: '92px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, border: '1px solid #434843' }}>
              <svg viewBox="0 0 76 92" width="76" height="92" aria-hidden="true">
                <rect width="76" height="92" fill="#1a1c1a" />
                <circle cx="38" cy="33" r="19" fill="#2a2c2a" />
                <path d="M4,92 Q4,62 38,62 Q72,62 72,92" fill="#2a2c2a" />
              </svg>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ color: '#e4e2e1', fontSize: '18px', fontWeight: 700, lineHeight: 1.25, marginBottom: '9px' }}>
                {selected.residentName}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ ...MONO, background: '#1b3022', color: '#b4cdb8', border: '1px solid #364c3c', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Citizen
                </span>
                <span style={{ ...MONO, background: '#252626', color: '#8d928c', border: '1px solid #434843', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Zone 12
                </span>
              </div>
            </div>
          </div>

          {/* ── Uploaded ID + Selfie Scan ── */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #252626' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

              {/* Uploaded ID */}
              <div>
                <div style={{ ...LABEL, marginBottom: '8px' }}>Uploaded ID</div>
                <div style={{ borderRadius: '4px', overflow: 'hidden', border: '1px solid #434843' }}>
                  <svg viewBox="0 0 128 80" width="100%" style={{ display: 'block' }} aria-hidden="true">
                    <rect width="128" height="80" fill="#222422" />
                    <rect x="8" y="10" width="30" height="40" fill="#1a1c1a" rx="2" />
                    <circle cx="23" cy="28" r="10" fill="#2e302e" />
                    <rect x="46" y="10" width="52" height="5"  fill="#3a3c3a" rx="1" />
                    <rect x="46" y="20" width="38" height="3.5" fill="#2e302e" rx="1" />
                    <rect x="46" y="27" width="44" height="3.5" fill="#2e302e" rx="1" />
                    <rect x="46" y="34" width="32" height="3.5" fill="#2e302e" rx="1" />
                    <rect x="8"  y="57" width="112" height="1.5" fill="#2e302e" rx="1" />
                    <rect x="8"  y="63" width="78"  height="1.5" fill="#2e302e" rx="1" />
                    <rect x="8"  y="69" width="50"  height="1.5" fill="#2e302e" rx="1" />
                  </svg>
                </div>
              </div>

              {/* Selfie Scan */}
              <div>
                <div style={{ ...LABEL, marginBottom: '8px' }}>Selfie Scan</div>
                <div style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden', border: '1px solid #434843' }}>
                  <svg viewBox="0 0 128 80" width="100%" style={{ display: 'block' }} aria-hidden="true">
                    <rect width="128" height="80" fill="#1a1c1a" />
                    <circle cx="64" cy="30" r="21" fill="#282a28" />
                    <path d="M10,80 Q10,52 64,52 Q118,52 118,80" fill="#282a28" />
                  </svg>
                  <div style={{ position: 'absolute', top: '5px', right: '5px', background: '#1b3022', border: '1px solid #364c3c', borderRadius: '2px', padding: '2px 6px' }}>
                    <span style={{ ...MONO, fontSize: '9px', fontWeight: 700, color: '#b4cdb8', letterSpacing: '0.06em' }}>
                      98.2% MATCH
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Proof of Residency ── */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #252626' }}>
            <div style={{ ...LABEL, marginBottom: '10px' }}>Proof of Residency</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0e0e0e', border: '1px solid #434843', borderRadius: '4px', padding: '10px 12px' }}>
              <div style={{ width: '32px', height: '32px', background: '#252626', border: '1px solid #434843', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <DocumentTextIcon style={{ width: '16px', height: '16px', color: '#8d928c' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#e4e2e1', fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Electric_Bill_Sept2024.pdf
                </div>
                <div style={{ ...MONO, color: '#8d928c', fontSize: '10px', marginTop: '2px', letterSpacing: '0.03em' }}>
                  Verified via Utility API
                </div>
              </div>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '4px' }}>
                <ArrowDownTrayIcon style={{ width: '16px', height: '16px', color: '#8d928c' }} />
              </button>
            </div>
          </div>

          {/* ── Verification data ── */}
          <div style={{ padding: '14px 16px' }}>
            {VERIFICATION_FIELDS.map(({ label, value, checked }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #252626' }}>
                <span style={{ color: '#8d928c', fontSize: '13px' }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {checked && <CheckCircleIcon style={{ width: '14px', height: '14px', color: '#22c55e' }} />}
                  <span style={{ ...MONO, fontSize: '12px', fontWeight: checked ? 700 : 400, color: checked ? '#b4cdb8' : '#c3c8c1', letterSpacing: checked ? '0.07em' : '0.02em' }}>
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Action buttons (sticky bottom) ── */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px', borderTop: '1px solid #434843', background: '#1b1c1c', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', background: '#2d0a0a', border: '1px solid #5f1a1a', borderRadius: '4px', padding: '11px', color: '#fca5a5', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em', ...INTER }}
          >
            <XCircleIcon style={{ width: '16px', height: '16px' }} />
            REJECT
          </button>
          <button
            type="button"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', background: '#1b3022', border: '1px solid #364c3c', borderRadius: '4px', padding: '11px', color: '#b4cdb8', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em', ...INTER }}
          >
            <CheckCircleIcon style={{ width: '16px', height: '16px' }} />
            APPROVE
          </button>
        </div>

        {/* ── Floating view-toggle buttons ── */}
        <div style={{ position: 'absolute', right: '12px', bottom: '80px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[Squares2X2Icon, UserCircleIcon].map((Icon, i) => (
            <button
              key={i}
              type="button"
              style={{ width: '36px', height: '36px', background: '#252626', border: '1px solid #434843', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Icon style={{ width: '16px', height: '16px', color: '#8d928c' }} />
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}
