import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPinIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import TanodTopNav from '../../components/TanodTopNav'
import TanodBottomNav from '../../components/TanodBottomNav'

const REASONS = [
  'Weapon Involved',
  'Suspect Fled Scene',
  'Multiple Suspects',
  'Civilian in Danger',
  'Officer Needs Assistance',
  'Other',
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.12em] text-tr-muted mb-2">
      {children}
    </p>
  )
}

export default function TanodEscalationPage() {
  const navigate = useNavigate()
  const [reason, setReason] = useState('Weapon Involved')
  const [context, setContext] = useState('')

  return (
    <div className="min-h-screen bg-tr-bg flex flex-col lg:pl-64">

      <TanodTopNav title="Field Responder" />

      <div className="flex-1 overflow-y-auto pb-28 lg:pb-8">
        <div className="px-4 sm:px-6 lg:px-8 pt-5 space-y-5 max-w-2xl mx-auto">

          {/* ── Current Incident summary ─────────────────────────── */}
          <div
            className="rounded-lg px-4 sm:px-5 py-3.5 bg-tr-surface"
            style={{ border: '1.5px solid #c3c8c1' }}
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <span
                className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.06em] text-tr-on-primary bg-tr-primary-container px-2.5 py-1"
                style={{ borderRadius: '3px' }}
              >
                Current Incident #2944
              </span>
              <span className="font-jetbrains text-[12px] text-tr-muted tracking-[0.04em] shrink-0">
                Active 12m
              </span>
            </div>
            <h2 className="font-hanken font-extrabold text-tr-on-surface text-[22px] leading-tight mb-2">
              Unidentified Subject Trespass
            </h2>
            <div className="flex items-center gap-1.5">
              <MapPinIcon className="w-4 h-4 text-tr-muted shrink-0" />
              <span className="font-hanken text-[14px] text-tr-muted">
                Northwest Industrial Zone, Gate 4
              </span>
            </div>
          </div>

          {/* ── Police Escalation warning ───────────────────────── */}
          <div
            className="rounded-lg px-5 py-7 sm:py-9 flex flex-col items-center gap-3"
            style={{ background: '#5f0004' }}
          >
            <ExclamationCircleIcon className="w-12 h-12 sm:w-14 sm:h-14" style={{ color: '#ff594e' }} />
            <p
              className="font-hanken font-extrabold uppercase text-center text-[26px] sm:text-[30px] leading-tight"
              style={{ color: '#ff594e' }}
            >
              Police Escalation
            </p>
            <p
              className="font-jetbrains text-[12px] font-semibold uppercase tracking-[0.06em] text-center leading-relaxed max-w-xs"
              style={{ color: '#ff594e', opacity: 0.85 }}
            >
              This will immediately notify police dispatch and request urgent backup.
            </p>
          </div>

          {/* ── Form: Reason + Context side-by-side on lg ─────────── */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-5 space-y-5 lg:space-y-0">

            {/* Reason for Escalation */}
            <div>
              <SectionLabel>Reason for Escalation</SectionLabel>
              <div className="relative" style={{ borderBottom: '2px solid #1b3022' }}>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full font-hanken font-semibold text-tr-on-surface text-[15px] appearance-none outline-none px-3 py-3.5 cursor-pointer"
                  style={{ background: '#e9e2a1' }}
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg viewBox="0 0 20 20" fill="#1b3022" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.09 1.03l-4.25 4.5a.75.75 0 01-1.09 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Additional Context */}
            <div>
              <SectionLabel>Additional Context (Optional)</SectionLabel>
              <div style={{ borderBottom: '2px solid #1b3022' }}>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Describe the immediate danger..."
                  rows={5}
                  className="w-full font-hanken text-[15px] text-tr-on-surface placeholder-tr-placeholder outline-none resize-none px-3 py-3.5"
                  style={{ background: '#e9e2a1' }}
                />
              </div>
            </div>

          </div>

          {/* ── Live GPS map ────────────────────────────────────── */}
          <div className="rounded-lg overflow-hidden relative h-[185px] sm:h-[220px] lg:h-[260px]">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 390 185"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <rect width="390" height="185" fill="#1a1a1a" />
              <rect x="0"   y="0"   width="71"  height="53" fill="#242424" />
              <rect x="77"  y="0"   width="114" height="53" fill="#242424" />
              <rect x="197" y="0"   width="114" height="53" fill="#242424" />
              <rect x="317" y="0"   width="73"  height="53" fill="#242424" />
              <rect x="0"   y="59"  width="71"  height="59" fill="#242424" />
              <rect x="77"  y="59"  width="114" height="59" fill="#242424" />
              <rect x="197" y="59"  width="114" height="59" fill="#242424" />
              <rect x="317" y="59"  width="73"  height="59" fill="#242424" />
              <rect x="0"   y="124" width="71"  height="61" fill="#242424" />
              <rect x="77"  y="124" width="114" height="61" fill="#242424" />
              <rect x="197" y="124" width="114" height="61" fill="#242424" />
              <rect x="317" y="124" width="73"  height="61" fill="#242424" />
              <rect x="71"  y="0"   width="6"   height="185" fill="#363636" />
              <rect x="191" y="0"   width="6"   height="185" fill="#363636" />
              <rect x="311" y="0"   width="6"   height="185" fill="#363636" />
              <rect x="0"   y="53"  width="390" height="6"   fill="#363636" />
              <rect x="0"   y="118" width="390" height="6"   fill="#363636" />
              <rect x="35"  y="0"   width="2" height="185" fill="#2c2c2c" />
              <rect x="133" y="0"   width="2" height="185" fill="#2c2c2c" />
              <rect x="253" y="0"   width="2" height="185" fill="#2c2c2c" />
              <rect x="353" y="0"   width="2" height="185" fill="#2c2c2c" />
              <rect x="0"   y="28"  width="390" height="2" fill="#2c2c2c" />
              <rect x="0"   y="88"  width="390" height="2" fill="#2c2c2c" />
              <rect x="0"   y="151" width="390" height="2" fill="#2c2c2c" />
              <circle cx="195" cy="92" r="24" fill="white" opacity="0.05" />
              <circle cx="195" cy="92" r="15" fill="white" opacity="0.10" />
              <circle cx="195" cy="92" r="6" fill="white" />
            </svg>

            <div className="absolute top-3 left-3">
              <div className="bg-tr-primary-container rounded px-3 py-1.5">
                <span className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] text-tr-on-primary">
                  Live Feed / GPS
                </span>
              </div>
            </div>
          </div>

          {/* ── Submit Escalation ───────────────────────────────── */}
          <button
            type="button"
            className="w-full rounded flex items-center justify-center gap-3 hover:opacity-90 active:opacity-80 transition-opacity"
            style={{ minHeight: '60px', background: '#b91c1c' }}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="15" r="2" fill="white" stroke="none" />
              <path d="M8.1 11.4a5.5 5.5 0 017.8 0" />
              <path d="M4.4 7.6a11 11 0 0115.2 0" />
            </svg>
            <span className="font-hanken font-extrabold uppercase tracking-wide text-[17px] text-white">
              Submit Escalation
            </span>
          </button>

          {/* ── Cancel and Return ───────────────────────────────── */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full rounded flex items-center justify-center hover:bg-tr-surface transition-colors"
            style={{ minHeight: '52px', border: '1.5px solid #c3c8c1' }}
          >
            <span className="font-jetbrains text-[12px] font-semibold uppercase tracking-[0.1em] text-tr-muted">
              Cancel and Return
            </span>
          </button>

        </div>
      </div>

      <TanodBottomNav active="home" />
    </div>
  )
}
