import { UserCircleIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import TanodTopNav from '../../components/TanodTopNav'
import TanodBottomNav from '../../components/TanodBottomNav'

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

// ── Data ───────────────────────────────────────────────────────────────────
const NEARBY = [
  { name: 'Ricardo S.', unit: 'Unit 04', distance: '120M', eta: '2 MINS AWAY' },
  { name: 'Elena B.',   unit: 'Unit 09', distance: '350M', eta: '5 MINS AWAY' },
  { name: 'Jun Jun P.', unit: 'Unit 12', distance: '480M', eta: '7 MINS AWAY' },
]

// ── Section label ──────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.12em] text-tr-muted mb-2">
      {children}
    </p>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function TanodRequestBackupPage() {
  return (
    <div className="min-h-screen bg-tr-bg flex flex-col lg:pl-64">

      <TanodTopNav title="Field Responder" showBack badgeDot />

      <div className="flex-1 overflow-y-auto pb-28 lg:pb-8">

        {/* ── Current Incident ─────────────────────────────────── */}
        <div className="px-4 sm:px-6 lg:px-8 pt-5 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Current Incident</SectionLabel>
            <span
              className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] text-white mb-2"
              style={{ background: '#b91c1c', padding: '3px 9px', borderRadius: '2px' }}
            >
              Critical
            </span>
          </div>

          <div
            className="bg-tr-surface rounded-lg px-4 sm:px-5 py-4 mb-5"
            style={{ border: '1.5px solid #c3c8c1' }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="font-hanken font-extrabold text-tr-on-surface text-[26px] leading-tight flex-1">
                Crowd Control: Brgy. 721
              </h2>
              <div className="text-right shrink-0 mt-1">
                <p className="font-jetbrains text-[14px] font-bold text-tr-on-surface leading-none">
                  12m
                </p>
                <p className="font-jetbrains text-[10px] text-tr-muted uppercase tracking-[0.1em] mt-0.5">
                  Elapsed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-3">
              <MapPinIcon className="w-4 h-4 text-tr-muted shrink-0" />
              <span className="font-hanken text-[14px] text-tr-muted">
                P. Ocampo St. cor Taft Avenue
              </span>
            </div>

            <div className="border-t border-tr-divider mb-3" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] text-tr-muted mb-1">
                  Active Units
                </p>
                <p className="font-hanken font-extrabold text-tr-on-surface text-[28px] leading-none">
                  02
                </p>
              </div>
              <div>
                <p className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] text-tr-muted mb-1">
                  Est. Crowd
                </p>
                <p className="font-hanken font-extrabold text-tr-on-surface text-[28px] leading-none">
                  50+
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tactical Map — full bleed within the shifted area ──── */}
        <div className="relative h-[260px] sm:h-[310px] lg:h-[360px]" style={{ isolation: 'isolate' }}>
          <MapContainer
            center={INCIDENT_COORDS}
            zoom={17}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            attributionControl={false}
            scrollWheelZoom={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" maxZoom={20} />
            <Marker position={INCIDENT_COORDS} icon={incidentPinIcon} />
            <Circle
              center={INCIDENT_COORDS}
              radius={500}
              pathOptions={{ color: '#6B8E23', fillColor: '#6B8E23', fillOpacity: 0.08, weight: 1.5, dashArray: '5,4' }}
            />
          </MapContainer>

          <div className="absolute bottom-3 right-3" style={{ zIndex: 1000 }}>
            <div className="bg-black/75 rounded px-3 py-1.5">
              <span className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                Radius: 500M
              </span>
            </div>
          </div>
        </div>

        {/* ── Nearby Tanods ────────────────────────────────────── */}
        <div className="px-4 sm:px-6 lg:px-8 pt-5 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-hanken font-extrabold text-tr-on-surface text-[22px]">
              Nearby Tanods
            </h2>
            <button
              type="button"
              className="font-jetbrains text-[11px] font-bold uppercase tracking-[0.1em] hover:opacity-70 transition-opacity"
              style={{ color: '#8b864e' }}
            >
              Refresh List
            </button>
          </div>

          {/* Two-column on lg */}
          <div className="space-y-2.5 lg:grid lg:grid-cols-2 lg:gap-2.5 lg:space-y-0">
            {NEARBY.map((t) => (
              <div
                key={t.unit}
                className="flex items-center gap-3 rounded-lg px-3.5 py-3 bg-white"
                style={{ border: '1.5px solid #c3c8c1' }}
              >
                <div
                  className="w-11 h-11 rounded flex items-center justify-center shrink-0"
                  style={{ background: '#d0e9d4', border: '1px solid #b4cdb8' }}
                >
                  <UserCircleIcon className="w-7 h-7" style={{ color: '#364c3c' }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-hanken font-bold text-tr-on-surface text-[15px]">
                    {t.name}{' '}
                    <span className="font-normal text-tr-muted text-[14px]">({t.unit})</span>
                  </p>
                  <p
                    className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.06em] mt-0.5"
                    style={{ color: '#8b864e' }}
                  >
                    {t.distance} · {t.eta}
                  </p>
                </div>

                <button
                  type="button"
                  className="bg-tr-primary-container text-tr-on-primary font-jetbrains font-bold uppercase rounded hover:opacity-90 active:opacity-80 transition-opacity shrink-0"
                  style={{ fontSize: '11px', letterSpacing: '0.08em', padding: '10px 16px' }}
                >
                  Request
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mass Reinforcement ───────────────────────────────── */}
        <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-2 max-w-3xl mx-auto">
          <button
            type="button"
            className="w-full rounded flex items-center justify-center gap-3 hover:opacity-90 active:opacity-80 transition-opacity"
            style={{ minHeight: '60px', background: '#5f0004' }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 shrink-0"
              fill="none"
              stroke="#ff594e"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="12" cy="15" r="2" fill="#ff594e" stroke="none" />
              <path d="M8.1 11.4a5.5 5.5 0 017.8 0" />
              <path d="M4.4 7.6a11 11 0 0115.2 0" />
            </svg>
            <span className="font-hanken font-extrabold uppercase tracking-wide text-[18px]" style={{ color: '#ffffff' }}>
              Mass Reinforcement
            </span>
          </button>
          <p className="font-jetbrains text-[11px] text-tr-muted text-center mt-2.5 italic">
            Sends alert to all available units within 500m
          </p>
        </div>

      </div>

      <TanodBottomNav active="home" />
    </div>
  )
}
