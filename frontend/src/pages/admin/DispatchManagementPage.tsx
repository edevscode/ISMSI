import { useState, useEffect, useCallback, useRef } from 'react'
import {
  TruckIcon,
  UserIcon,
  EyeIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  SpeakerWaveIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline'
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import AdminSidebar from '../../components/AdminSidebar'
import AdminTopBar from '../../components/AdminTopBar'
import { listIncidents, assignTanod, type Incident as ApiIncident } from '../../api/incidents'
import { listDeployments, type TanodDeployment } from '../../api/tanods'
import { getSession } from '../../api/auth'

// ── Barangay Bolacan, Bocaue, Bulacan ────────────────────────────────────────
const MAP_CENTER: [number, number] = [14.7983, 120.9172]

// ── Priority colours ──────────────────────────────────────────────────────────
const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: '#C0392B',
  HIGH:     '#E67E22',
  MEDIUM:   '#eab308',
  LOW:      '#22c55e',
}

// ── Status sets ───────────────────────────────────────────────────────────────
const ACTIVE_STATUSES = new Set(['REPORTED', 'ASSIGNED', 'RESPONDING', 'ON_SCENE', 'ESCALATED'])

// ── Status colours for tanod deployments ─────────────────────────────────────
const TANOD_STATUS_COLOR: Record<string, string> = {
  AVAILABLE:  '#22c55e',
  RESPONDING: '#E67E22',
  ON_BREAK:   '#eab308',
  OFF_DUTY:   '#6b7280',
}

// ── Map icon factories ────────────────────────────────────────────────────────
const RING = (color: string, delay: string) =>
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='22' height='22' style='position:absolute;top:50%;left:50%;margin-top:-11px;margin-left:-11px;animation:radar-wave 2.4s ease-out infinite;animation-delay:${delay};pointer-events:none;overflow:visible;'>
    <path fill='none' stroke='${color}' stroke-width='1.5' stroke-linejoin='round' d='M12 3 2.5 20.5h19Z'/>
  </svg>`

function incidentMarkerIcon(priority: string, selected: boolean): L.DivIcon {
  const color = PRIORITY_COLOR[priority] ?? '#8d928c'
  const size = selected ? 36 : 28
  const svgSize = selected ? 30 : 22
  const half = size / 2
  return L.divIcon({
    className: '',
    iconSize:   [size, size],
    iconAnchor: [half, half],
    html: `<div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;overflow:visible;">
      ${RING(color, '0s')}${RING(color, '0.8s')}${RING(color, '1.6s')}
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='${svgSize}' height='${svgSize}' style='position:relative;z-index:1;filter:drop-shadow(0 0 ${selected ? 7 : 4}px ${color}${selected ? 'cc' : '99'})'>
        <path fill='${color}' stroke='${color}' stroke-width='0.5' d='M12 3 2.5 20.5h19Z' opacity='0.95'/>
        <line x1='12' y1='9' x2='12' y2='14.5' stroke='rgba(0,0,0,0.6)' stroke-width='1.8' stroke-linecap='round'/>
        <circle cx='12' cy='16.5' r='0.9' fill='rgba(0,0,0,0.6)'/>
      </svg>
    </div>`,
  })
}

function tanodMarkerIcon(status: string, selected: boolean): L.DivIcon {
  const color = TANOD_STATUS_COLOR[status] ?? '#22c55e'
  const border = selected ? '#b4cdb8' : color
  return L.divIcon({
    className: '',
    iconSize:   [26, 26],
    iconAnchor: [13, 13],
    html: `<div style="width:26px;height:26px;border-radius:4px;background:#1b1c1c;border:2px solid ${border};display:flex;align-items:center;justify-content:center;box-shadow:0 0 ${selected ? 10 : 6}px ${border}${selected ? '99' : '55'};">
      <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='${border}' stroke-width='2'>
        <path stroke-linecap='round' stroke-linejoin='round' d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'/>
      </svg>
    </div>`,
  })
}

// ── Pan to selected incident/tanod when it changes ────────────────────────────
function MapFocus({ lat, lng }: { lat: number; lng: number }) {
  const map  = useMap()
  const prev = useRef('')
  useEffect(() => {
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`
    if (key !== prev.current) { prev.current = key; map.setView([lat, lng], 17, { animate: true }) }
  }, [lat, lng, map])
  return null
}

// ── Force Leaflet to recalculate its size after container resize ───────────────
function MapResizeHandler({ trigger }: { trigger: boolean }) {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 50)
    return () => clearTimeout(t)
  }, [trigger, map])
  return null
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function elapsedStr(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function fmtType(t: string, other?: string | null): string {
  if (t === 'OTHER' && other) return other
  return t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const MONO: React.CSSProperties  = { fontFamily: "'JetBrains Mono', monospace" }
const INTER: React.CSSProperties = { fontFamily: 'Inter, sans-serif' }
const LABEL: React.CSSProperties = { ...MONO, fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#8d928c' }

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminDispatchManagementPage() {
  const session = getSession()

  const [incidents,          setIncidents]          = useState<ApiIncident[]>([])
  const [tanods,             setTanods]             = useState<TanodDeployment[]>([])
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null)
  const [selectedTanodId,    setSelectedTanodId]    = useState<number | null>(null)
  const [loading,            setLoading]            = useState(true)
  const [assigning,          setAssigning]          = useState(false)
  const [toast,              setToast]              = useState<{ msg: string; ok: boolean } | null>(null)
  const [tick,               setTick]               = useState(0)
  const [sidebarOpen,        setSidebarOpen]        = useState(false)
  const [mapMaximized,       setMapMaximized]       = useState(false)

  // 1-second tick for live elapsed timer
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const [incData, rawTanods] = await Promise.all([
        listIncidents(),
        listDeployments(),
      ])
      setIncidents(incData)
      // Deduplicate by tanod_id — keep the most recent deployment record per tanod
      const seen = new Map<number, typeof rawTanods[0]>()
      for (const t of rawTanods) {
        const existing = seen.get(t.tanod_id)
        if (!existing || t.id > existing.id) seen.set(t.tanod_id, t)
      }
      setTanods([...seen.values()])
    } catch { /* keep previous state */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Poll every 20 s
  useEffect(() => {
    const t = setInterval(fetchData, 20_000)
    return () => clearInterval(t)
  }, [fetchData])

  // Auto-select most critical active incident on first load
  useEffect(() => {
    if (selectedIncidentId !== null || incidents.length === 0) return
    for (const p of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']) {
      const inc = incidents.find(i => i.priority === p && ACTIVE_STATUSES.has(i.status))
      if (inc) { setSelectedIncidentId(inc.id); break }
    }
  }, [incidents, selectedIncidentId])

  // ── Derived ──────────────────────────────────────────────────────────────────
  const activeIncidents     = incidents.filter(i => ACTIVE_STATUSES.has(i.status))
  const selectedIncident    = incidents.find(i => i.id === selectedIncidentId) ?? null
  const selectedTanod       = tanods.find(t => t.id === selectedTanodId) ?? null
  const escalatedIncidents  = incidents
    .filter(i => i.status === 'ESCALATED' || i.status === 'REFERRED_TO_POLICE')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6)

  const mapIncidents = activeIncidents.filter(
    i => i.latitude && i.longitude &&
         !isNaN(parseFloat(i.latitude)) && !isNaN(parseFloat(i.longitude)),
  )

  const selLat   = selectedIncident?.latitude  ? parseFloat(selectedIncident.latitude)  : null
  const selLng   = selectedIncident?.longitude ? parseFloat(selectedIncident.longitude) : null
  const tanodPos = selectedTanod
    ? [parseFloat(selectedTanod.latitude), parseFloat(selectedTanod.longitude)] as [number, number]
    : null

  // Map focus: tanod takes priority when selected, falls back to selected incident
  const focusLat = selectedTanod ? parseFloat(selectedTanod.latitude)  : selLat
  const focusLng = selectedTanod ? parseFloat(selectedTanod.longitude) : selLng

  const criticalEscalated = escalatedIncidents.filter(i => i.status === 'ESCALATED').length

  // ── Actions ───────────────────────────────────────────────────────────────────
  const handleAssign = async (role: 'PRIMARY' | 'BACKUP') => {
    if (!selectedIncident || !selectedTanod || assigning) return
    setAssigning(true)
    try {
      await assignTanod(selectedIncident.id, selectedTanod.tanod_id, role)
      await fetchData()
      setToast({
        ok: true,
        msg: role === 'PRIMARY'
          ? `${selectedTanod.tanod_name} assigned as primary responder`
          : `${selectedTanod.tanod_name} assigned as backup`,
      })
    } catch {
      setToast({ ok: false, msg: 'Failed to assign. Please try again.' })
    } finally {
      setAssigning(false)
      setTimeout(() => setToast(null), 4000)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#131313', overflow: 'hidden', ...INTER }}>

      <AdminSidebar active="dispatch" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        <AdminTopBar
          searchPlaceholder="Search incidents, tanods, or locations..."
          onMenuClick={() => setSidebarOpen(true)}
          midSlot={
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid #434843', paddingLeft: '14px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ ...INTER, color: '#e4e2e1', fontSize: '12px', fontWeight: 700 }}>
                  {session?.full_name ?? 'Admin'}
                </div>
                <div style={{ ...MONO, color: '#8d928c', fontSize: '10px', letterSpacing: '0.04em' }}>Dispatcher</div>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #434843', background: '#252626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserIcon style={{ width: '18px', height: '18px', color: '#8d928c' }} />
              </div>
            </div>
          }
        />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ── Tanod list panel ─────────────────────────────────────────── */}
          <div className="hidden lg:flex" style={{ width: '292px', background: '#1b1c1c', borderRight: '1px solid #434843', flexDirection: 'column', flexShrink: 0 }}>

            <div style={{ padding: '14px 16px', borderBottom: '1px solid #434843', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ color: '#e4e2e1', fontSize: '16px', fontWeight: 700 }}>Active Tanods</span>
              <span style={{ ...MONO, background: '#252626', border: '1px solid #434843', color: '#c3c8c1', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '2px', letterSpacing: '0.07em' }}>
                {loading ? '—' : `TOTAL: ${tanods.length}`}
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', ...MONO, fontSize: '11px', color: '#8d928c' }}>Loading tanods…</div>
              ) : tanods.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', ...MONO, fontSize: '11px', color: '#8d928c' }}>No tanods registered.</div>
              ) : tanods.map(tanod => {
                const isSel = tanod.id === selectedTanodId
                return (
                  <div
                    key={tanod.id}
                    onClick={() => setSelectedTanodId(isSel ? null : tanod.id)}
                    style={{
                      padding: '12px 14px', borderBottom: '1px solid #252626',
                      background: isSel ? '#212622' : 'transparent',
                      borderLeft: isSel ? '3px solid #b4cdb8' : '3px solid transparent',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#1a1b1a' }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: '38px', height: '38px', background: '#252626', border: '1px solid #434843', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TruckIcon style={{ width: '20px', height: '20px', color: '#8d928c' }} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '9px', height: '9px', borderRadius: '50%', background: TANOD_STATUS_COLOR[tanod.availability_status] ?? '#22c55e', border: '1.5px solid #1b1c1c' }} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#e4e2e1', fontSize: '14px', fontWeight: 700, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tanod.tanod_name}
                        </div>
                        <div style={{ ...MONO, fontSize: '10px', fontWeight: 700, color: TANOD_STATUS_COLOR[tanod.availability_status] ?? '#22c55e', letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: '2px' }}>
                          {tanod.availability_status.replace('_', ' ')}
                        </div>
                        <div style={{ ...MONO, fontSize: '10px', color: '#6b7280', marginTop: '2px', letterSpacing: '0.03em' }}>
                          {tanod.phone_number}
                        </div>
                      </div>

                      <button
                        type="button"
                        title="Locate on map"
                        onClick={e => { e.stopPropagation(); setSelectedTanodId(tanod.id) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
                      >
                        <EyeIcon style={{ width: '14px', height: '14px', color: '#8d928c' }} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Map column ───────────────────────────────────────────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Active incident banner */}
            {selectedIncident ? (
              <div style={{ background: '#1b1c1c', borderBottom: '1px solid #434843', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '4px', flexShrink: 0,
                  background: selectedIncident.priority === 'CRITICAL' ? '#93000a' : '#3a2800',
                  border: `1px solid ${selectedIncident.priority === 'CRITICAL' ? '#7f1d1d' : '#5a3e00'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: '#fff', fontSize: '26px', fontWeight: 900, lineHeight: 1 }}>✱</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ ...MONO, fontSize: '10px', fontWeight: 700, color: PRIORITY_COLOR[selectedIncident.priority] ?? '#8d928c', letterSpacing: '0.09em' }}>
                      {selectedIncident.priority}
                    </span>
                    <span style={{ ...MONO, fontSize: '10px', fontWeight: 700, color: '#b4cdb8', letterSpacing: '0.06em' }}>
                      #{selectedIncident.incident_number}
                    </span>
                    {activeIncidents.length > 1 && (
                      <span style={{ ...MONO, fontSize: '10px', color: '#434843' }}>
                        {activeIncidents.findIndex(i => i.id === selectedIncident.id) + 1}/{activeIncidents.length} active
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#e4e2e1', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fmtType(selectedIncident.incident_type, selectedIncident.other_incident_type)}
                  </div>
                  {selectedIncident.resolved_address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                      <MapPinIcon style={{ width: '11px', height: '11px', color: '#8d928c', flexShrink: 0 }} />
                      <span style={{ color: '#8d928c', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedIncident.resolved_address}
                      </span>
                    </div>
                  )}
                </div>

                {/* Incident dot picker — cycle through active incidents */}
                {activeIncidents.length > 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                    {activeIncidents.slice(0, 6).map(inc => (
                      <button
                        key={inc.id}
                        type="button"
                        title={inc.incident_number}
                        onClick={() => setSelectedIncidentId(inc.id)}
                        style={{
                          width: inc.id === selectedIncidentId ? '10px' : '7px',
                          height: inc.id === selectedIncidentId ? '10px' : '7px',
                          borderRadius: '50%',
                          background: inc.id === selectedIncidentId ? (PRIORITY_COLOR[inc.priority] ?? '#8d928c') : '#434843',
                          border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.15s',
                        }}
                      />
                    ))}
                  </div>
                )}

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ ...LABEL, marginBottom: '4px' }}>Time Elapsed</div>
                  <div style={{ ...MONO, fontSize: '28px', fontWeight: 700, color: '#e4e2e1', lineHeight: 1 }}>
                    {tick >= 0 && elapsedStr(selectedIncident.created_at)}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: '#1b1c1c', borderBottom: '1px solid #434843', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: loading ? '#434843' : '#22c55e' }} />
                <span style={{ ...MONO, fontSize: '12px', color: '#8d928c', letterSpacing: '0.06em' }}>
                  {loading ? 'Loading incidents…' : 'No active incidents at this time'}
                </span>
              </div>
            )}

            {/* Map */}
            <div style={mapMaximized
              ? { position: 'fixed', inset: 0, zIndex: 50, isolation: 'isolate', display: 'flex', flexDirection: 'column' }
              : { flex: 1, position: 'relative', overflow: 'hidden', isolation: 'isolate' }
            }>
              <MapContainer
                center={MAP_CENTER}
                zoom={16}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                zoomControl={false}
                attributionControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  maxZoom={20}
                />

                <MapResizeHandler trigger={mapMaximized} />

                {focusLat !== null && focusLng !== null && (
                  <MapFocus lat={focusLat} lng={focusLng} />
                )}

                {/* Active incident markers */}
                {mapIncidents.map(inc => (
                  <Marker
                    key={inc.id}
                    position={[parseFloat(inc.latitude), parseFloat(inc.longitude)]}
                    icon={incidentMarkerIcon(inc.priority, inc.id === selectedIncidentId)}
                    zIndexOffset={inc.id === selectedIncidentId ? 1000 : inc.priority === 'CRITICAL' ? 500 : 0}
                    eventHandlers={{ click: () => setSelectedIncidentId(inc.id) }}
                  >
                    <Tooltip direction="top" offset={[0, -16]}>
                      <div style={{ ...MONO, fontSize: '11px' }}>
                        <div style={{ color: PRIORITY_COLOR[inc.priority] ?? '#8d928c', fontWeight: 700 }}>{inc.priority}</div>
                        <div style={{ color: '#e4e2e1' }}>{inc.incident_number}</div>
                        <div style={{ color: '#8d928c', fontSize: '10px' }}>{fmtType(inc.incident_type, inc.other_incident_type)}</div>
                        <div style={{ color: '#6b7280', fontSize: '10px' }}>{inc.status}</div>
                      </div>
                    </Tooltip>
                  </Marker>
                ))}

                {/* Tanod markers — real GPS from deployments */}
                {tanods.map(tanod => {
                  const pos   = [parseFloat(tanod.latitude), parseFloat(tanod.longitude)] as [number, number]
                  const isSel = tanod.id === selectedTanodId
                  const sc    = TANOD_STATUS_COLOR[tanod.availability_status] ?? '#22c55e'
                  return (
                    <Marker
                      key={tanod.id}
                      position={pos}
                      icon={tanodMarkerIcon(tanod.availability_status, isSel)}
                      zIndexOffset={isSel ? 500 : 0}
                      eventHandlers={{ click: () => setSelectedTanodId(isSel ? null : tanod.id) }}
                    >
                      <Tooltip direction="top" offset={[0, -16]}>
                        <div style={{ ...MONO, fontSize: '11px' }}>
                          <div style={{ color: '#e4e2e1', fontWeight: 700 }}>{tanod.tanod_name}</div>
                          <div style={{ color: sc, fontSize: '10px' }}>{tanod.availability_status.replace('_', ' ')}</div>
                          {tanod.zone_label && <div style={{ color: '#8d928c', fontSize: '10px' }}>{tanod.zone_label}</div>}
                          <div style={{ color: '#8d928c', fontSize: '10px' }}>{tanod.phone_number}</div>
                        </div>
                      </Tooltip>
                    </Marker>
                  )
                })}

                {/* Dispatch line: selected tanod → selected incident */}
                {tanodPos && selLat !== null && selLng !== null && (
                  <Polyline
                    positions={[tanodPos, [selLat, selLng]]}
                    pathOptions={{ color: '#c3cc8c', weight: 1.5, dashArray: '6,5', opacity: 0.8 }}
                  />
                )}
              </MapContainer>

              {/* Maximize / minimize toggle */}
              <button
                type="button"
                onClick={() => setMapMaximized(v => !v)}
                title={mapMaximized ? 'Minimize map' : 'Maximize map'}
                style={{
                  position: 'absolute', top: '12px', right: '12px', zIndex: 900,
                  width: '36px', height: '36px',
                  background: 'rgba(27,28,28,0.92)', border: '1px solid #434843',
                  borderRadius: '4px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,38,38,0.97)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(27,28,28,0.92)')}
              >
                {mapMaximized
                  ? <ArrowsPointingInIcon  style={{ width: '18px', height: '18px', color: '#b4cdb8' }} />
                  : <ArrowsPointingOutIcon style={{ width: '18px', height: '18px', color: '#b4cdb8' }} />
                }
              </button>

              {/* Dispatch action overlay */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 900, background: 'rgba(12,14,12,0.93)', borderTop: '1px solid #434843', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '18px' }}>

                {/* Selected tanod */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{ ...LABEL, marginBottom: '6px' }}>Selected Tanod</div>
                  {selectedTanod ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '4px', border: '1px solid #364c3c', background: '#1b3022', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserIcon style={{ width: '22px', height: '22px', color: '#b4cdb8' }} />
                      </div>
                      <div>
                        <div style={{ color: '#e4e2e1', fontSize: '18px', fontWeight: 700, lineHeight: 1.15 }}>
                          {selectedTanod.tanod_name}
                        </div>
                        <div style={{ ...MONO, fontSize: '10px', color: TANOD_STATUS_COLOR[selectedTanod.availability_status] ?? '#22c55e', marginTop: '2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {selectedTanod.availability_status.replace('_', ' ')}
                        </div>
                        <div style={{ ...MONO, fontSize: '10px', color: '#8d928c', marginTop: '2px' }}>
                          {selectedTanod.phone_number}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>Select a tanod</div>
                  )}
                </div>

                {/* Target incident */}
                {selectedIncident && (
                  <div style={{ borderLeft: '1px solid #434843', paddingLeft: '18px', flexShrink: 0 }}>
                    <div style={{ ...LABEL, marginBottom: '4px' }}>Target Incident</div>
                    <div style={{ ...MONO, fontSize: '12px', fontWeight: 700, color: PRIORITY_COLOR[selectedIncident.priority] ?? '#8d928c' }}>
                      {selectedIncident.incident_number}
                    </div>
                    <div style={{ color: '#c3c8c1', fontSize: '12px', marginTop: '2px' }}>
                      {fmtType(selectedIncident.incident_type, selectedIncident.other_incident_type)}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div style={{ flex: 1, display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    disabled={!selectedTanod || !selectedIncident || assigning}
                    onClick={() => handleAssign('PRIMARY')}
                    style={{
                      flex: 1, maxWidth: '220px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      background: (!selectedTanod || !selectedIncident) ? '#1a1a1a' : '#1b3022',
                      border: `1px solid ${(!selectedTanod || !selectedIncident) ? '#2a2a2a' : '#364c3c'}`,
                      borderRadius: '4px', padding: '14px',
                      color: (!selectedTanod || !selectedIncident) ? '#434843' : '#b4cdb8',
                      fontSize: '14px', fontWeight: 700,
                      cursor: (!selectedTanod || !selectedIncident || assigning) ? 'not-allowed' : 'pointer',
                      opacity: assigning ? 0.6 : 1, lineHeight: 1.25, ...INTER,
                    }}
                  >
                    <ShieldCheckIcon style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                    {assigning ? 'Assigning…' : 'Assign Primary Responder'}
                  </button>
                  <button
                    type="button"
                    disabled={!selectedTanod || !selectedIncident || assigning}
                    onClick={() => handleAssign('BACKUP')}
                    style={{
                      flex: 1, maxWidth: '180px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      background: (!selectedTanod || !selectedIncident) ? '#1a1a1a' : '#434b18',
                      border: `1px solid ${(!selectedTanod || !selectedIncident) ? '#2a2a2a' : '#5a6325'}`,
                      borderRadius: '4px', padding: '14px',
                      color: (!selectedTanod || !selectedIncident) ? '#434843' : '#c3cc8c',
                      fontSize: '14px', fontWeight: 700,
                      cursor: (!selectedTanod || !selectedIncident || assigning) ? 'not-allowed' : 'pointer',
                      lineHeight: 1.25, ...INTER,
                    }}
                  >
                    <UserPlusIcon style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                    Mark Responding
                  </button>
                </div>
              </div>
            </div>

            {/* Escalation strip */}
            <div style={{ height: '210px', background: '#0f100f', borderTop: '1px solid #434843', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #252626', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ ...LABEL }}>Escalation Center</span>
                  {criticalEscalated > 0 && (
                    <>
                      <div className="animate-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444' }} />
                      <span style={{ ...MONO, fontSize: '11px', fontWeight: 700, color: '#ef4444', letterSpacing: '0.06em' }}>
                        {criticalEscalated} Pending
                      </span>
                    </>
                  )}
                </div>
                <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', color: '#8d928c', fontSize: '12px', ...INTER }}>
                  View Full Logs
                  <ArrowTopRightOnSquareIcon style={{ width: '13px', height: '13px' }} />
                </button>
              </div>

              <div style={{ flex: 1, display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 16px', alignItems: 'stretch' }}>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center', ...MONO, fontSize: '11px', color: '#8d928c' }}>Loading…</div>
                ) : escalatedIncidents.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center', ...MONO, fontSize: '11px', color: '#8d928c' }}>No escalated incidents.</div>
                ) : escalatedIncidents.map(inc => {
                  const isEscalated = inc.status === 'ESCALATED'
                  const badge = isEscalated
                    ? { bg: '#450a0a', fg: '#fca5a5', border: '#7f1d1d', label: 'PENDING ESCALATION' }
                    : { bg: '#1b3022', fg: '#b4cdb8', border: '#364c3c', label: 'REFERRED TO POLICE' }
                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncidentId(inc.id)}
                      style={{
                        minWidth: '340px', maxWidth: '360px',
                        background: isEscalated ? '#180e0e' : '#1b1c1c',
                        border: `1px solid ${isEscalated ? '#5f1a1a' : '#2a2a2a'}`,
                        borderRadius: '4px', padding: '12px 14px',
                        display: 'flex', flexDirection: 'column', flexShrink: 0, cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ ...MONO, fontSize: '9px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: '2px', background: badge.bg, color: badge.fg, border: `1px solid ${badge.border}` }}>
                          {badge.label}
                        </span>
                        <span style={{ ...MONO, fontSize: '11px', color: '#8d928c', letterSpacing: '0.04em' }}>
                          {fmtTime(inc.updated_at)}
                        </span>
                      </div>

                      <div style={{ color: '#e4e2e1', fontSize: '14px', fontWeight: 700, marginBottom: '5px', lineHeight: 1.3 }}>
                        {inc.incident_number} — {fmtType(inc.incident_type, inc.other_incident_type)}
                      </div>

                      <div style={{ color: '#8d928c', fontSize: '11.5px', lineHeight: 1.55, flex: 1, overflow: 'hidden' }}>
                        {inc.resolved_address ?? (
                          inc.latitude && inc.longitude
                            ? `${parseFloat(inc.latitude).toFixed(4)}, ${parseFloat(inc.longitude).toFixed(4)}`
                            : 'Location unavailable'
                        )}
                        {inc.reports[0]?.description && (
                          <span style={{ display: 'block', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {inc.reports[0].description}
                          </span>
                        )}
                      </div>

                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ClockIcon style={{ width: '12px', height: '12px', color: '#8d928c' }} />
                          <span style={{ ...MONO, fontSize: '10px', color: '#8d928c', letterSpacing: '0.04em' }}>
                            {tick >= 0 && elapsedStr(inc.created_at)} elapsed
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                          {isEscalated ? (
                            <>
                              <button type="button" onClick={e => e.stopPropagation()} style={{ background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '3px', padding: '4px 9px', color: '#fca5a5', fontSize: '11px', fontWeight: 600, cursor: 'pointer', ...INTER }}>
                                Escalate Now
                              </button>
                              <button type="button" onClick={e => e.stopPropagation()} style={{ background: 'transparent', border: '1px solid #434843', borderRadius: '3px', padding: '4px 9px', color: '#8d928c', fontSize: '11px', cursor: 'pointer', ...INTER }}>
                                Dismiss
                              </button>
                            </>
                          ) : (
                            <button type="button" onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: '1px solid #434843', borderRadius: '3px', padding: '4px 9px', color: '#c3c8c1', fontSize: '11px', cursor: 'pointer', ...INTER }}>
                              <SpeakerWaveIcon style={{ width: '12px', height: '12px' }} />
                              Monitor
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: toast.ok ? '#1b3022' : '#450a0a', border: `1px solid ${toast.ok ? '#364c3c' : '#7f1d1d'}`, borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', ...INTER }}>
          {toast.ok
            ? <CheckCircleIcon style={{ width: '18px', height: '18px', color: '#b4cdb8', flexShrink: 0 }} />
            : <XMarkIcon       style={{ width: '18px', height: '18px', color: '#fca5a5', flexShrink: 0 }} />
          }
          <span style={{ color: toast.ok ? '#b4cdb8' : '#fca5a5', fontSize: '13px', fontWeight: 600 }}>
            {toast.msg}
          </span>
        </div>
      )}
    </div>
  )
}
