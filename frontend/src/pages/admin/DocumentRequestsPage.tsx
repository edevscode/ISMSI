import { useState } from 'react'
import {
  FunnelIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  CheckCircleIcon,
  MapPinIcon,
  PrinterIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import AdminSidebar from '../../components/AdminSidebar'
import AdminTopBar from '../../components/AdminTopBar'

// ── Types & data ────────────────────────────────────────────────────────────

type DocStatus = 'PROCESSING' | 'PENDING' | 'COMPLETED' | 'REJECTED'

interface DocRequest {
  id: string; reqNum: string; residentName: string
  docType: string; dateRequested: string; status: DocStatus
}

const REQUESTS: DocRequest[] = [
  { id: 'D1', reqNum: 'DR-2024-0891', residentName: 'Elena V. Santos',     docType: 'Barangay Clearance',       dateRequested: '2024-10-24  09:15', status: 'PROCESSING' },
  { id: 'D2', reqNum: 'DR-2024-0892', residentName: 'Marcus J. Rivera',    docType: 'Certificate of Indigency', dateRequested: '2024-10-24  10:02', status: 'PENDING'    },
  { id: 'D3', reqNum: 'DR-2024-0888', residentName: 'Sarah L. Concepcion', docType: 'Permit to Operate',        dateRequested: '2024-10-23  14:45', status: 'COMPLETED'  },
  { id: 'D4', reqNum: 'DR-2024-0885', residentName: 'Ricardo P. Gomez',    docType: 'Barangay Clearance',       dateRequested: '2024-10-23  11:20', status: 'REJECTED'   },
  { id: 'D5', reqNum: 'DR-2024-0895', residentName: 'Janice M. Lim',       docType: 'Certificate of Residency', dateRequested: '2024-10-24  11:30', status: 'PENDING'    },
]

const STATUS_STYLE: Record<DocStatus, { bg: string; color: string; border: string }> = {
  PROCESSING: { bg: '#434b18',     color: '#c3cc8c', border: '#5a6325' },
  PENDING:    { bg: 'transparent', color: '#8d928c', border: '#434843' },
  COMPLETED:  { bg: '#252626',     color: '#6b7280', border: '#2a2a2a' },
  REJECTED:   { bg: '#450a0a',     color: '#fca5a5', border: '#7f1d1d' },
}

// ── Style helpers ───────────────────────────────────────────────────────────

const MONO: React.CSSProperties  = { fontFamily: "'JetBrains Mono', monospace" }
const INTER: React.CSSProperties = { fontFamily: 'Inter, sans-serif' }
const LABEL: React.CSSProperties = { ...MONO, fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#8d928c' }

// ── Main page ───────────────────────────────────────────────────────────────

export default function AdminDocumentRequestsPage() {
  const [selectedId, setSelectedId] = useState('D1')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const selected = REQUESTS.find((r) => r.id === selectedId)!

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#131313', overflow: 'hidden', ...INTER }}>

      <AdminSidebar active="documents" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        <AdminTopBar searchPlaceholder="Search Request ID or Resident Name..." onMenuClick={() => setSidebarOpen(true)} />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ══ CENTER ══ */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ background: '#1f2020', borderBottom: '1px solid #434843', padding: '14px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <div style={{ color: '#e4e2e1', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '3px' }}>
                  Active Requests Queue
                </div>
                <div style={{ color: '#8d928c', fontSize: '12.5px' }}>
                  Monitoring 12 pending municipal document applications.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#252626', border: '1px solid #434843', borderRadius: '4px', padding: '7px 12px', color: '#c3c8c1', fontSize: '12px', cursor: 'pointer', ...INTER }}>
                  <FunnelIcon style={{ width: '13px', height: '13px' }} />
                  Filter
                </button>
                <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#252626', border: '1px solid #434843', borderRadius: '4px', padding: '7px 12px', color: '#c3c8c1', fontSize: '12px', cursor: 'pointer', ...INTER }}>
                  <ArrowDownTrayIcon style={{ width: '13px', height: '13px' }} />
                  Export
                </button>
              </div>
            </div>

            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr 1.3fr 1fr', background: '#1b1c1c', borderBottom: '1px solid #434843', padding: '0 20px', flexShrink: 0 }}>
              {['Req #', 'Resident Name', 'Document Type', 'Date Requested', 'Status'].map((col) => (
                <div key={col} style={{ ...LABEL, padding: '10px 0' }}>{col}</div>
              ))}
            </div>

            {/* Rows */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {REQUESTS.map((req) => {
                const isSelected = req.id === selectedId
                const ss = STATUS_STYLE[req.status]
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedId(req.id)}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr 1.3fr 1fr',
                      padding: '0 20px', borderBottom: '1px solid #252626',
                      background: isSelected ? '#232424' : 'transparent',
                      borderLeft: isSelected ? '3px solid #b4cdb8' : '3px solid transparent',
                      cursor: 'pointer', alignItems: 'center', minHeight: '68px',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ ...MONO, fontSize: '11px', fontWeight: 700, color: '#c3cc8c', letterSpacing: '0.04em', lineHeight: 1.55 }}>
                      {req.reqNum.replace('DR-2024-', 'DR-\n2024-')}
                    </div>
                    <div style={{ color: '#e4e2e1', fontSize: '13px', fontWeight: 600 }}>{req.residentName}</div>
                    <div style={{ color: '#c3c8c1', fontSize: '13px' }}>{req.docType}</div>
                    <div style={{ ...MONO, color: '#8d928c', fontSize: '11px', letterSpacing: '0.02em' }}>{req.dateRequested}</div>
                    <div>
                      <span style={{ ...MONO, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Priority alert strip */}
            <div style={{ background: '#7f1d1d', borderTop: '1px solid #991b1b', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <ExclamationCircleIcon style={{ width: '18px', height: '18px', color: '#fca5a5', flexShrink: 0 }} />
              <span style={{ ...MONO, fontSize: '12px', fontWeight: 700, color: '#fca5a5', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Priority: 3 New Permits Pending
              </span>
            </div>
          </div>

          {/* ══ RIGHT PANEL ══ */}
          <aside className="hidden xl:flex" style={{ width: '380px', background: '#1b1c1c', borderLeft: '1px solid #434843', flexDirection: 'column', flexShrink: 0 }}>

            {/* Panel header */}
            <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #434843', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ color: '#e4e2e1', fontSize: '15px', fontWeight: 700 }}>Request Details</span>
              <span style={{ ...MONO, fontSize: '11px', color: '#c3cc8c', letterSpacing: '0.05em', fontWeight: 700 }}>
                #{selected.reqNum.replace('DR-', '')}
              </span>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '130px' }}>

              {/* Resident info */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #252626', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {/* Portrait */}
                <div style={{ width: '72px', height: '86px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, border: '1px solid #434843' }}>
                  <svg viewBox="0 0 72 86" width="72" height="86" aria-hidden="true">
                    <rect width="72" height="86" fill="#1a1c1a" />
                    <circle cx="36" cy="30" r="17" fill="#2a2c2a" />
                    <path d="M4,86 Q4,58 36,58 Q68,58 68,86" fill="#2a2c2a" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#e4e2e1', fontSize: '17px', fontWeight: 700, marginBottom: '5px' }}>{selected.residentName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                    <CheckCircleIcon style={{ width: '13px', height: '13px', color: '#22c55e' }} />
                    <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: 600 }}>Verified Resident</span>
                  </div>
                  <div style={{ ...MONO, color: '#8d928c', fontSize: '11px', letterSpacing: '0.04em' }}>ID: PH-MUNIC-882910</div>
                </div>
              </div>

              {/* Meta */}
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #252626', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#252626', border: '1px solid #434843', borderRadius: '4px', padding: '7px 10px' }}>
                  <CheckCircleIcon style={{ width: '14px', height: '14px', color: '#22c55e' }} />
                  <span style={{ color: '#c3c8c1', fontSize: '13px', flex: 1 }}>No Active Case</span>
                  <button type="button" style={{ ...MONO, background: 'none', border: 'none', color: '#8d928c', fontSize: '10px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Clear</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#252626', border: '1px solid #434843', borderRadius: '4px', padding: '7px 10px' }}>
                  <MapPinIcon style={{ width: '14px', height: '14px', color: '#8d928c' }} />
                  <span style={{ color: '#c3c8c1', fontSize: '13px' }}>Zone 4, Brgy. Central</span>
                </div>
              </div>

              {/* Document preview */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ ...LABEL, marginBottom: '10px' }}>Document Preview</div>
                <div style={{ background: '#f5f4ef', borderRadius: '4px', padding: '24px 20px', border: '1px solid #c3c8c1', minHeight: '480px' }}>
                  {/* Gov document */}
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    {/* Seal icon */}
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #8d928c', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8e4df' }}>
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                        <circle cx="14" cy="14" r="12" fill="none" stroke="#8d928c" strokeWidth="1.5" />
                        <rect x="10" y="8" width="8" height="12" fill="none" stroke="#8d928c" strokeWidth="1" rx="1" />
                        <line x1="8" y1="22" x2="20" y2="22" stroke="#8d928c" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div style={{ fontFamily: 'serif', color: '#2a2a2a', fontSize: '11px', lineHeight: 1.5, letterSpacing: '0.03em' }}>
                      REPUBLIC OF THE PHILIPPINES<br />
                      PROVINCE OF AURORA<br />
                      MUNICIPALITY OF CASIGURAN
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #2a2a2a', borderBottom: '1px solid #2a2a2a', padding: '10px 0', textAlign: 'center', margin: '0 0 16px' }}>
                    <div style={{ fontFamily: 'serif', color: '#1a1a1a', fontSize: '18px', fontWeight: 700, letterSpacing: '0.04em' }}>
                      BARANGAY CLEARANCE
                    </div>
                  </div>

                  <div style={{ fontFamily: 'serif', color: '#2a2a2a', fontSize: '12px', lineHeight: 1.7, marginBottom: '16px' }}>
                    <div style={{ marginBottom: '12px', color: '#555', fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      TO WHOM IT MAY CONCERN:
                    </div>
                    <p style={{ marginBottom: '10px' }}>
                      This is to certify that <strong style={{ textDecoration: 'underline' }}>{selected.residentName}</strong>, of legal age, Filipino, is a bona fide resident of <strong style={{ textDecoration: 'underline' }}>Zone 4, Barangay Central</strong>, this Municipality.
                    </p>
                    <p style={{ marginBottom: '16px' }}>
                      This certification is being issued upon the request of the above-named person for whatever legal purpose it may serve.
                    </p>
                    <p style={{ fontSize: '12px' }}>Given this 24th day of October, 2024.</p>
                  </div>

                  <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <div style={{ borderTop: '1px solid #2a2a2a', width: '160px', margin: '0 auto 6px' }} />
                    <div style={{ fontFamily: 'serif', fontSize: '12px', color: '#2a2a2a', letterSpacing: '0.04em' }}>
                      Punong Barangay
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#1b1c1c', borderTop: '1px solid #434843' }}>
              <button
                type="button"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#b4cdb8', color: '#203527', border: 'none', padding: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', ...MONO }}
              >
                <PrinterIcon style={{ width: '16px', height: '16px' }} />
                Generate Document
              </button>
              <div style={{ display: 'flex' }}>
                <button type="button" style={{ flex: 1, background: 'transparent', border: 'none', borderTop: '1px solid #434843', borderRight: '1px solid #434843', padding: '11px', color: '#b4cdb8', fontSize: '13px', fontWeight: 600, cursor: 'pointer', ...INTER }}>
                  Approve
                </button>
                <button type="button" style={{ flex: 1, background: '#2d0a0a', border: 'none', borderTop: '1px solid #5f1a1a', padding: '11px', color: '#fca5a5', fontSize: '13px', fontWeight: 600, cursor: 'pointer', ...INTER }}>
                  Reject
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
