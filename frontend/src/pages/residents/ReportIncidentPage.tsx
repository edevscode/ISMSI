import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPinIcon,
  CameraIcon,
  VideoCameraIcon,
  ChevronDownIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline'
import { ShieldCheckIcon } from '@heroicons/react/24/solid'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import TopNav from '../../components/TopNav'
import BottomNav from '../../components/BottomNav'
import { submitIncident } from '../../api/incidents'

const BRGY_CENTER: [number, number] = [14.7983, 120.9172]

const gpsMarkerIcon = L.divIcon({
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#fc8a40;border:3px solid white;box-shadow:0 0 8px rgba(252,138,64,0.6);"></div>`,
})

const manualPinIcon = L.divIcon({
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 0 0 4px rgba(239,68,68,0.25),0 2px 8px rgba(0,0,0,0.25);"></div>`,
})

function MapRecenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lon], 17) }, [lat, lon, map])
  return null
}

function MapClickHandler({ onPin }: { onPin: (lat: number, lon: number) => void }) {
  useMapEvents({ click: (e) => onPin(e.latlng.lat, e.latlng.lng) })
  return null
}

const INCIDENT_TYPES: { value: string; label: string }[] = [
  { value: 'PHYSICAL_ALTERCATION', label: 'Physical Altercation' },
  { value: 'THEFT',                label: 'Theft' },
  { value: 'VANDALISM',            label: 'Vandalism' },
  { value: 'DOMESTIC_DISTURBANCE', label: 'Domestic Disturbance' },
  { value: 'SUSPICIOUS_ACTIVITY',  label: 'Suspicious Activity' },
  { value: 'NOISE_COMPLAINT',      label: 'Noise Complaint' },
  { value: 'OTHER',                label: 'Other' },
]

type GpsState = 'requesting' | 'success' | 'failed'

export default function ReportIncidentPage() {
  const navigate  = useNavigate()

  const [incidentType,      setIncidentType]      = useState('')
  const [otherIncidentType, setOtherIncidentType] = useState('')
  const [description,       setDescription]       = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState(false)

  const [gpsState,        setGpsState]        = useState<GpsState>('requesting')
  const [gpsCoords,       setGpsCoords]       = useState<{ lat: number; lon: number } | null>(null)
  const [manualPin,       setManualPin]       = useState<{ lat: number; lon: number } | null>(null)
  const [manualOverride,  setManualOverride]  = useState(false)
  const [mapExpanded,     setMapExpanded]     = useState(false)
  const [gpsEverFailed,   setGpsEverFailed]   = useState(false)
  const [gpsBrowserDenied, setGpsBrowserDenied] = useState(false)

  // When override is active, manual pin wins; otherwise GPS then manual pin
  const reportLocation = (manualOverride && manualPin) ? manualPin : (gpsCoords ?? manualPin)

  const tryGps = useCallback(async () => {
    if (!navigator.geolocation) { setGpsState('failed'); setGpsEverFailed(true); return }

    // Check if the browser has hard-blocked location
    if (navigator.permissions) {
      try {
        const perm = await navigator.permissions.query({ name: 'geolocation' })
        if (perm.state === 'denied') {
          setGpsState('failed')
          setGpsEverFailed(true)
          setGpsBrowserDenied(true)
          return
        }
        setGpsBrowserDenied(false)
      } catch { /* permissions API unavailable — proceed */ }
    }

    setGpsState('requesting')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setGpsCoords({ lat: coords.latitude, lon: coords.longitude })
        setGpsState('success')
        setGpsEverFailed(false)
        setGpsBrowserDenied(false)
      },
      () => { setGpsState('failed'); setGpsEverFailed(true) },
      { enableHighAccuracy: true, timeout: 8_000 },
    )
  }, [])

  useEffect(() => { tryGps() }, [tryGps])

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!incidentType)                                         { setError('Please select an incident type.'); return }
    if (incidentType === 'OTHER' && !otherIncidentType.trim()) { setError('Please specify the incident type.'); return }
    if (!description.trim())                                   { setError('Please describe the incident.'); return }
    if (!reportLocation)                                       { setError('Please pin your location on the map so responders can find you.'); return }

    setLoading(true)
    setError('')
    try {
      await submitIncident({
        incident_type:       incidentType,
        other_incident_type: incidentType === 'OTHER' ? otherIncidentType.trim() : undefined,
        description:         description.trim(),
        latitude:            parseFloat(reportLocation.lat.toFixed(8)),
        longitude:           parseFloat(reportLocation.lon.toFixed(8)),
        location_source:     (manualOverride && manualPin) ? 'MANUAL' : gpsCoords ? 'GPS' : 'MANUAL',
      })
      setSuccess(true)
    } catch {
      setError('Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col lg:pl-64">
        <TopNav title="Report Submitted" showBack />
        <div className="hidden lg:block"><BottomNav active="dashboard" /></div>
        <div className="flex-1 flex flex-col items-center justify-center px-5 gap-5 pb-20">
          <div className="bg-surface rounded-2xl shadow-card p-8 w-full max-w-sm flex flex-col items-center gap-4 text-center">
            <CheckCircleIcon className="w-16 h-16 text-primary" />
            <h2 className="font-bold text-on-surface text-[20px]">Report Submitted</h2>
            <p className="text-sm text-muted leading-relaxed">
              Your incident report has been sent to ISMSI Command. The nearest available tanod has been
              notified and will respond shortly.
            </p>
            <button
              type="button"
              onClick={() => navigate('/residents/dashboard')}
              className="mt-2 w-full bg-accent text-on-primary font-semibold text-[16px] rounded-lg py-4 hover:opacity-90 transition-opacity"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const mapCenter: [number, number] = (manualOverride && manualPin)
    ? [manualPin.lat, manualPin.lon]
    : gpsCoords
    ? [gpsCoords.lat, gpsCoords.lon]
    : manualPin
    ? [manualPin.lat, manualPin.lon]
    : BRGY_CENTER

  // GPS failed path (banner + retry button visible)
  const isManualMode    = gpsEverFailed || gpsState === 'failed'
  const isRetrying      = isManualMode && gpsState === 'requesting'
  // Map is interactive when GPS failed OR user explicitly chose to pin manually
  const isMapInteractive = isManualMode || manualOverride

  return (
    <div className="min-h-screen bg-background flex flex-col lg:pl-64">
      <TopNav title="Report Incident" showBack />
      <div className="hidden lg:block"><BottomNav active="dashboard" /></div>

      <form onSubmit={handleSubmit} className="flex-1 px-5 sm:px-6 lg:px-8 pt-6 pb-28 overflow-y-auto space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">

          <div>
            <h2 className="font-bold text-on-surface text-[16px] mb-1.5">Submit a Safety Report</h2>
            <p className="text-sm text-muted leading-relaxed">
              Your report helps keep our community safe. Please provide as much detail as possible.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Incident Type */}
          <div>
            <label className="block text-[12px] font-semibold text-on-surface uppercase tracking-widest mb-2">Incident Type</label>
            <div className="relative">
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full appearance-none bg-surface border border-outline rounded-lg px-4 py-3.5 text-sm text-muted outline-none focus:border-primary transition-colors pr-10"
              >
                <option value="" disabled>Select an incident type</option>
                {INCIDENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-placeholder pointer-events-none" />
            </div>

            {incidentType === 'OTHER' && (
              <input
                type="text"
                value={otherIncidentType}
                onChange={(e) => setOtherIncidentType(e.target.value)}
                placeholder="Please specify the incident type"
                maxLength={255}
                className="mt-2 w-full bg-surface border border-outline rounded-lg px-4 py-3 text-sm text-on-surface outline-none focus:border-primary transition-colors placeholder:text-placeholder"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-semibold text-on-surface uppercase tracking-widest mb-2">Detailed Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident, people involved, and any specific details..."
              rows={6}
              className="w-full bg-surface border border-outline rounded-lg px-4 py-3.5 text-sm text-on-surface placeholder-placeholder outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* ── Location Section ──────────────────────────────────── */}
          <div className="bg-surface border border-divider rounded-2xl overflow-hidden shadow-card">

            {/* Header */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-on-surface" />
                  <span className="font-bold text-on-surface text-[16px]">Incident Location</span>
                </div>

                {/* Status badge */}
                {gpsState === 'success' && !manualOverride && (
                  <span className="text-[10px] font-bold tracking-wider text-on-primary px-2.5 py-1 rounded-full uppercase bg-primary">
                    GPS Active
                  </span>
                )}
                {gpsState === 'success' && manualOverride && !manualPin && (
                  <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                    Pin Manually
                  </span>
                )}
                {gpsState === 'success' && manualOverride && manualPin && (
                  <span className="text-[10px] font-bold tracking-wider text-white px-2.5 py-1 rounded-full uppercase" style={{ background: '#0369a1' }}>
                    Pinned
                  </span>
                )}
                {gpsState === 'requesting' && (
                  <span className="text-[10px] font-bold tracking-wider text-muted px-2.5 py-1 rounded-full uppercase bg-surface-low">
                    Locating…
                  </span>
                )}
                {gpsState === 'failed' && !manualPin && (
                  <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase" style={{ background: '#fff3e0', color: '#9a3412' }}>
                    Pin Required
                  </span>
                )}
                {gpsState === 'failed' && manualPin && (
                  <span className="text-[10px] font-bold tracking-wider text-on-primary px-2.5 py-1 rounded-full uppercase" style={{ background: '#ef4444' }}>
                    Location Pinned
                  </span>
                )}
              </div>

              {/* Coords display */}
              {gpsState === 'success' && gpsCoords && !manualOverride && (
                <p className="text-xs text-muted font-mono">
                  {gpsCoords.lat.toFixed(6)}, {gpsCoords.lon.toFixed(6)}
                </p>
              )}
              {manualOverride && manualPin && (
                <p className="text-xs font-mono" style={{ color: '#0369a1' }}>
                  {manualPin.lat.toFixed(6)}, {manualPin.lon.toFixed(6)}
                </p>
              )}
              {gpsState === 'failed' && manualPin && !manualOverride && (
                <p className="text-xs text-muted font-mono">
                  {manualPin.lat.toFixed(6)}, {manualPin.lon.toFixed(6)}
                </p>
              )}
            </div>

            {/* Manual override banner (GPS active but user chose to pin manually) */}
            {gpsState === 'success' && manualOverride && (
              <div className="mx-4 mb-3 rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#0369a1' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: '#0369a1' }}>
                    {manualPin ? 'Location pinned — tap to move it' : 'Tap the map to pin exact location'}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: '#0284c7' }}>
                    Your manual pin will be used instead of GPS.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setManualOverride(false); setManualPin(null) }}
                  className="shrink-0 text-[11px] font-bold uppercase tracking-wide hover:opacity-70 transition-opacity"
                  style={{ color: '#0369a1' }}
                >
                  Use GPS
                </button>
              </div>
            )}

            {/* GPS failed banner — retry + manual pin instruction */}
            {isManualMode && (
              <div className="mx-4 mb-3 rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: '#fff8f0', border: '1px solid #fed7aa' }}>
                <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#9a3412' }} />
                <div className="flex-1 min-w-0">
                  {gpsBrowserDenied ? (
                    <>
                      <p className="text-[13px] font-semibold" style={{ color: '#9a3412' }}>
                        Location blocked by browser
                      </p>
                      <p className="text-[12px] mt-0.5 leading-snug" style={{ color: '#c2693a' }}>
                        Tap the lock icon in your address bar → Site settings → set Location to Allow, then tap Retry GPS.
                      </p>
                    </>
                  ) : isRetrying ? (
                    <>
                      <p className="text-[13px] font-semibold" style={{ color: '#9a3412' }}>
                        Requesting location…
                      </p>
                      <p className="text-[12px] mt-0.5" style={{ color: '#c2693a' }}>
                        Respond to the permission dialog if it appears.
      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[13px] font-semibold" style={{ color: '#9a3412' }}>
                        GPS unavailable — tap the map to pin your location
                      </p>
                      <p className="text-[12px] mt-0.5" style={{ color: '#c2693a' }}>
                        Drag to explore, then tap the exact spot where the incident occurred.
                      </p>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={tryGps}
                  disabled={isRetrying}
                  className="shrink-0 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide hover:opacity-70 transition-opacity disabled:opacity-40"
                  style={{ color: '#9a3412' }}
                >
                  <ArrowPathIcon className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Asking…' : 'Retry GPS'}
                </button>
              </div>
            )}

            {/* Map */}
            <div className="relative overflow-hidden" style={{ height: isMapInteractive ? '280px' : '208px', isolation: 'isolate' }}>

              {/* Expand button — Leaflet-style control, top-right corner */}
              <button
                type="button"
                onClick={() => setMapExpanded(true)}
                title="Expand map"
                className="absolute top-4 right-4 bg-white rounded-sm flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
                style={{ zIndex: 1000, width: 30, height: 30, boxShadow: '0 1px 5px rgba(0,0,0,0.25)', border: '1px solid rgba(0,0,0,0.12)' }}
              >
                <ArrowsPointingOutIcon className="w-4 h-4 text-gray-700" />
              </button>

              {/* Pin manually — floating pill, bottom-left, only when GPS active and no override */}
              {gpsState === 'success' && !manualOverride && (
                <button
                  type="button"
                  onClick={() => setManualOverride(true)}
                  className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  style={{ zIndex: 1000, boxShadow: '0 1px 5px rgba(0,0,0,0.25)', border: '1px solid rgba(0,0,0,0.12)' }}
                >
                  <MapPinIcon className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-[11px] font-semibold text-gray-700">Pin manually</span>
                </button>
              )}

              <MapContainer
                center={mapCenter}
                zoom={17}
                style={{ width: '100%', height: '100%' }}
                zoomControl={isMapInteractive}
                attributionControl={false}
                scrollWheelZoom={isMapInteractive}
                dragging={isMapInteractive ? undefined : false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" maxZoom={20} />

                {/* GPS marker — shown when GPS active and no manual override pin */}
                {gpsState === 'success' && gpsCoords && !(manualOverride && manualPin) && (
                  <>
                    <MapRecenter lat={gpsCoords.lat} lon={gpsCoords.lon} />
                    <Marker position={[gpsCoords.lat, gpsCoords.lon]} icon={gpsMarkerIcon} />
                  </>
                )}

                {/* Manual pin click handler + marker */}
                {isMapInteractive && (
                  <>
                    <MapClickHandler onPin={(lat, lon) => setManualPin({ lat, lon })} />
                    {manualPin && (
                      <>
                        <MapRecenter lat={manualPin.lat} lon={manualPin.lon} />
                        <Marker position={[manualPin.lat, manualPin.lon]} icon={manualPinIcon} />
                      </>
                    )}
                  </>
                )}
              </MapContainer>

              {/* Tap-to-pin hint overlay */}
              {isMapInteractive && !manualPin && (
                <div
                  className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none"
                  style={{ zIndex: 1000 }}
                >
                  <div className="bg-black/70 rounded-full px-4 py-2 flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-white" />
                    <span className="text-white text-[12px] font-semibold">Tap the map to drop a pin</span>
                  </div>
                </div>
              )}

              {/* Move-pin hint after pin is placed */}
              {isMapInteractive && manualPin && (
                <div
                  className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none"
                  style={{ zIndex: 1000 }}
                >
                  <div className="bg-black/70 rounded-full px-4 py-2 flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-white text-[12px] font-semibold">Pin set — tap to move it</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Evidence */}
          <div>
            <label className="block text-[12px] font-semibold text-on-surface uppercase tracking-widest mb-3">Evidence (Optional)</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="bg-surface-low border-2 border-dashed border-divider rounded-2xl py-8 flex flex-col items-center justify-center gap-2.5 hover:bg-surface-mid transition-colors">
                <CameraIcon className="w-7 h-7 text-muted" />
                <span className="text-sm font-semibold text-muted">Upload Photo</span>
              </button>
              <button type="button" className="bg-surface-low border-2 border-dashed border-divider rounded-2xl py-8 flex flex-col items-center justify-center gap-2.5 hover:bg-surface-mid transition-colors">
                <VideoCameraIcon className="w-7 h-7 text-muted" />
                <span className="text-sm font-semibold text-muted">Upload Video</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl px-4 py-4 flex items-start gap-3 bg-primary/5 border border-primary/20">
            <ShieldCheckIcon className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
            <p className="text-sm leading-relaxed text-primary">
              This report will be sent directly to ISMSI security dispatch. False reports are subject to community review.
            </p>
          </div>

        </div>
      </form>

      <div className="fixed bottom-0 left-0 right-0 lg:left-64 px-5 py-4 bg-background z-20">
        <button
          onClick={handleSubmit}
          disabled={loading || (gpsState === 'requesting')}
          className="w-full bg-accent text-on-primary font-semibold text-[16px] rounded-lg py-4 flex items-center justify-center gap-2 hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-60"
        >
          {loading ? 'Submitting…' : 'Submit Report'}
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>

      {/* ── Full-screen map overlay ───────────────────────────────────── */}
      {mapExpanded && (
        <div className="fixed inset-0" style={{ zIndex: 99999 }}>

          {/* Map fills the entire screen */}
          <div className="absolute inset-0" style={{ isolation: 'isolate' }}>
            <MapContainer
              center={mapCenter}
              zoom={17}
              style={{ width: '100%', height: '100%' }}
              zoomControl
              attributionControl={false}
              scrollWheelZoom
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                maxZoom={20}
              />

              {gpsState === 'success' && gpsCoords && !(manualOverride && manualPin) && (
                <>
                  <MapRecenter lat={gpsCoords.lat} lon={gpsCoords.lon} />
                  <Marker position={[gpsCoords.lat, gpsCoords.lon]} icon={gpsMarkerIcon} />
                </>
              )}

              {isMapInteractive && (
                <>
                  {manualPin && <MapRecenter lat={manualPin.lat} lon={manualPin.lon} />}
                  <MapClickHandler onPin={(lat, lon) => setManualPin({ lat, lon })} />
                  {manualPin && (
                    <Marker position={[manualPin.lat, manualPin.lon]} icon={manualPinIcon} />
                  )}
                </>
              )}
            </MapContainer>

            {/* Tap-to-pin hint pill — centered near bottom */}
            <div
              className="absolute left-0 right-0 flex justify-center pointer-events-none"
              style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)', zIndex: 1000 }}
            >
              {isMapInteractive && !manualPin && (
                <div className="bg-black/75 rounded-full px-5 py-2.5 flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-white" />
                  <span className="text-white text-[13px] font-semibold">Tap the map to drop a pin</span>
                </div>
              )}
              {isMapInteractive && manualPin && (
                <div className="bg-black/75 rounded-full px-5 py-2.5 flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  <span className="text-white text-[13px] font-semibold">Pin set — tap to move it</span>
                </div>
              )}
            </div>

            {/* Pinned coords — bottom-left floating badge */}
            {isManualMode && manualPin && (
              <div
                className="absolute left-4 rounded-lg px-3 py-2 pointer-events-none"
                style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)', zIndex: 1000, background: 'rgba(0,0,0,0.65)' }}
              >
                <p className="text-white font-mono text-[11px] leading-snug">{manualPin.lat.toFixed(6)}</p>
                <p className="text-white font-mono text-[11px] leading-snug">{manualPin.lon.toFixed(6)}</p>
              </div>
            )}

            {/* Minimize button — top-right, Leaflet-style control */}
            <button
              type="button"
              onClick={() => setMapExpanded(false)}
              title="Minimize map"
              className="absolute top-6 right-6 bg-white rounded-sm flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
              style={{
                zIndex: 1000,
                width: 30,
                height: 30,
                boxShadow: '0 1px 5px rgba(0,0,0,0.25)',
                border: '1px solid rgba(0,0,0,0.12)',
              }}
            >
              <ArrowsPointingInIcon className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
