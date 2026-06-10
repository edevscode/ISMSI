import { Link } from 'react-router-dom'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import TanodTopNav from '../../components/TanodTopNav'
import TanodBottomNav from '../../components/TanodBottomNav'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const INCIDENT_COORDS: [number, number] = [14.7995, 120.9185]

const incidentPinIcon = L.divIcon({
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  html: `<div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
    <div class="incident-pulse-ring"></div>
    <div class="incident-pulse-ring incident-pulse-ring2"></div>
    <div style="width:16px;height:16px;border-radius:50%;background:#C0392B;border:2px solid rgba(255,255,255,0.25);box-shadow:0 0 8px #C0392B88;position:relative;z-index:1;"></div>
  </div>`,
})

// ── Types ──────────────────────────────────────────────────────────────────
interface TimelineEntry {
  label: string
  subtitle: string
  time: string
  status: 'done' | 'current'
}

const TIMELINE: TimelineEntry[] = [
  { label: 'Incident Reported',        subtitle: 'System Automated Alert - Sector 7', time: '14:02', status: 'done'    },
  { label: 'Responder Assigned',        subtitle: 'Unit Delta-9 (You)',                 time: '14:05', status: 'done'    },
  { label: 'Current Status: En Route',  subtitle: 'Estimated arrival in 4 mins',        time: '14:12', status: 'current' },
]

// ── Section label ──────────────────────────────────────────────────────────
function SectionLabel({
  children,
  aside,
}: {
  children: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <p className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.12em] text-tr-muted">
        {children}
      </p>
      {aside && (
        <span className="font-jetbrains text-[11px] text-tr-muted tracking-[0.06em]">
          {aside}
        </span>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function TanodIncidentDetailPage() {
  return (
    <div className="min-h-screen bg-tr-bg flex flex-col lg:pl-64">

      <TanodTopNav title="#INC-2024-0982" showBack badge="En Route" />

      <div className="flex-1 overflow-y-auto pb-28 lg:pb-8">
        <div className="px-4 sm:px-6 lg:px-8 pt-5 space-y-5 max-w-2xl mx-auto">

          {/* ── Reported Description ────────────────────────────────── */}
          <div>
            <SectionLabel aside="14:02 PST">Reported Description</SectionLabel>
            <div className="p-4 sm:p-5 rounded" style={{ border: '1.5px solid #1b1c19' }}>
              <p className="font-hanken text-[15px] text-tr-on-surface leading-relaxed">
                Severe water main breach reported at North sector perimeter. High pressure
                flow affecting foundation of Outpost 4. Immediate containment required to
                prevent structural failure.
              </p>
            </div>
          </div>

          {/* ── Reporter Notes ──────────────────────────────────────── */}
          <div>
            <SectionLabel>Reporter Notes</SectionLabel>
            <div className="p-4 sm:p-5 rounded space-y-2.5" style={{ border: '1.5px solid #c3c8c1' }}>
              <div className="flex items-center gap-2">
                <UserCircleIcon className="w-4 h-4 text-tr-muted shrink-0" />
                <span className="font-jetbrains text-[12px] font-semibold text-tr-on-surface tracking-[0.04em]">
                  Sgt. Miller, Field Recon
                </span>
              </div>
              <p className="font-hanken text-[14px] text-tr-muted leading-relaxed">
                "Visible cracks forming in the retaining wall. Ground saturation is critical.
                Advise heavy lifting equipment for temporary damming."
              </p>
            </div>
          </div>

          {/* ── Incident Location ───────────────────────────────────── */}
          <div>
            <SectionLabel>Incident Location</SectionLabel>
            <div className="rounded overflow-hidden relative h-[210px] sm:h-[250px] lg:h-[300px]" style={{ isolation: 'isolate' }}>
              <MapContainer
                center={INCIDENT_COORDS}
                zoom={17}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                zoomControl={false}
                attributionControl={false}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" maxZoom={20} />
                <Marker position={INCIDENT_COORDS} icon={incidentPinIcon} />
              </MapContainer>

              {/* Navigate button overlay */}
              <button
                type="button"
                className="absolute bottom-3 right-3 flex items-center gap-2 rounded hover:opacity-90 active:opacity-80 transition-opacity"
                style={{
                  background: 'rgba(250,249,244,0.95)',
                  border: '1.5px solid #1b3022',
                  padding: '6px 12px',
                }}
              >
                <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0" fill="#1b3022">
                  <path d="M10 1l2.5 6.5H18L13.5 11l1.8 6.5L10 14 4.7 17.5 6.5 11 2 7.5h5.5z" />
                </svg>
                <span className="font-jetbrains text-[11px] font-bold uppercase tracking-[0.1em] text-tr-on-surface">
                  Navigate
                </span>
              </button>
            </div>
          </div>

          {/* ── Status Timeline ─────────────────────────────────────── */}
          <div>
            <SectionLabel>Status Timeline</SectionLabel>
            <div>
              {TIMELINE.map((entry, idx) => (
                <div key={entry.label} className="flex gap-4">
                  {/* Dot + connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className="rounded-full shrink-0"
                      style={{
                        width:      entry.status === 'current' ? '14px' : '10px',
                        height:     entry.status === 'current' ? '14px' : '10px',
                        background: entry.status === 'current' ? '#1b3022' : '#1b1c19',
                        marginTop:  entry.status === 'current' ? '2px'    : '4px',
                      }}
                    />
                    {idx < TIMELINE.length - 1 && (
                      <div className="w-px flex-1 min-h-[28px] bg-tr-divider mt-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-5 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-jetbrains text-[12px] font-semibold uppercase tracking-[0.08em] text-tr-on-surface leading-tight">
                        {entry.label}
                      </p>
                      <span className="font-jetbrains text-[11px] text-tr-muted tracking-[0.04em] shrink-0">
                        {entry.time}
                      </span>
                    </div>
                    <p className="font-hanken text-[13px] text-tr-muted mt-0.5">
                      {entry.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-tr-divider" />

          {/* ── Response Actions ────────────────────────────────────── */}
          <div>
            <SectionLabel>Response Actions</SectionLabel>
            {/* On desktop: two-column grid for the action buttons */}
            <div className="space-y-2.5 sm:grid sm:grid-cols-2 sm:gap-2.5 sm:space-y-0">

              <button
                type="button"
                disabled
                className="w-full rounded font-hanken font-bold uppercase flex items-center justify-center"
                style={{
                  minHeight: '52px',
                  fontSize: '14px',
                  letterSpacing: '0.1em',
                  border: '1.5px solid #c3c8c1',
                  color: '#c3c8c1',
                  cursor: 'default',
                }}
              >
                Accept Response
              </button>

              <button
                type="button"
                className="w-full rounded font-hanken font-bold uppercase flex items-center justify-center"
                style={{
                  minHeight: '52px',
                  fontSize: '14px',
                  letterSpacing: '0.1em',
                  background: '#1b3022',
                  color: '#819986',
                }}
              >
                On The Way
              </button>

              <button
                type="button"
                className="w-full rounded font-hanken font-extrabold uppercase flex items-center justify-center hover:opacity-90 active:scale-[0.99] transition-all sm:col-span-2"
                style={{
                  minHeight: '56px',
                  fontSize: '14px',
                  letterSpacing: '0.1em',
                  background: '#1b3022',
                  color: '#ffffff',
                }}
              >
                Arrived On Scene
              </button>

              <button
                type="button"
                className="w-full bg-white rounded font-hanken font-bold uppercase flex items-center justify-center hover:bg-tr-surface transition-colors"
                style={{
                  minHeight: '52px',
                  fontSize: '14px',
                  letterSpacing: '0.1em',
                  border: '1.5px solid #1b1c19',
                  color: '#1b1c19',
                }}
              >
                Resolved
              </button>

              <Link
                to="/tanod/escalate"
                className="w-full rounded font-hanken font-extrabold uppercase flex items-center justify-center hover:opacity-90 active:opacity-80 transition-opacity"
                style={{
                  minHeight: '52px',
                  fontSize: '14px',
                  letterSpacing: '0.1em',
                  background: '#5f0004',
                  color: '#ff594e',
                }}
              >
                Escalate
              </Link>

            </div>
          </div>

        </div>
      </div>

      <TanodBottomNav active="incidents" />
    </div>
  )
}
