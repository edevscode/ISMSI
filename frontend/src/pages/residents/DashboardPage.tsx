import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ExclamationCircleIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  BoltIcon,
  ShieldExclamationIcon,
  SpeakerWaveIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import TopNav from '../../components/TopNav'
import BottomNav from '../../components/BottomNav'
import { getSession } from '../../api/auth'
import { listIncidents, type Incident } from '../../api/incidents'
import { getNotifications, type Notification } from '../../api/notifications'

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const ACTIVE_STATUSES = new Set(['REPORTED', 'ASSIGNED', 'RESPONDING', 'ON_SCENE', 'ESCALATED'])

const TYPE_ICON: Record<string, React.ElementType> = {
  PHYSICAL_ALTERCATION: BoltIcon,
  THEFT:                ExclamationTriangleIcon,
  VANDALISM:            ShieldExclamationIcon,
  DOMESTIC_DISTURBANCE: ShieldExclamationIcon,
  SUSPICIOUS_ACTIVITY:  ExclamationCircleIcon,
  NOISE_COMPLAINT:      SpeakerWaveIcon,
  OTHER:                ExclamationCircleIcon,
}

const TYPE_LABEL: Record<string, string> = {
  PHYSICAL_ALTERCATION: 'Physical Altercation',
  THEFT:                'Theft',
  VANDALISM:            'Vandalism',
  DOMESTIC_DISTURBANCE: 'Domestic Disturbance',
  SUSPICIOUS_ACTIVITY:  'Suspicious Activity',
  NOISE_COMPLAINT:      'Noise Complaint',
  OTHER:                'Other',
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const session = getSession()
  const [incidents, setIncidents]       = useState<Incident[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!session) { navigate('/residents/login'); return }

    Promise.all([listIncidents(), getNotifications()])
      .then(([incs, notifs]) => {
        setIncidents(incs)
        setNotifications(notifs)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const pendingCount  = incidents.filter((i) => ACTIVE_STATUSES.has(i.status)).length
  const firstUnread   = notifications.find((n) => !n.is_read)
  const recentTwo     = incidents.slice(0, 2)

  return (
    <div className="min-h-screen bg-background flex flex-col lg:pl-64">
      <TopNav title="ISMSI Portal" showAvatar />

      <div className="flex-1 px-5 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
        {/* Greeting */}
        <h1 className="text-[28px] font-bold text-on-surface leading-tight mb-1">
          Welcome back, {session?.first_name ?? 'Resident'}!
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-6">
          Stay safe and updated with your community today.
        </p>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <button
            type="button"
            onClick={() => navigate('/residents/report-incident')}
            className="bg-accent text-on-primary rounded-2xl p-5 flex flex-col items-center justify-center gap-3 py-7 hover:opacity-90 active:opacity-80 transition-opacity"
          >
            <ExclamationCircleIcon className="w-9 h-9" />
            <span className="font-semibold text-[14px] text-center leading-tight">Report Incident</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/residents/request-document')}
            className="bg-primary text-on-primary rounded-2xl p-5 flex flex-col items-center justify-center gap-3 py-7 hover:opacity-90 active:opacity-80 transition-opacity"
          >
            <DocumentTextIcon className="w-9 h-9" />
            <span className="font-semibold text-[14px] text-center leading-tight">Request Document</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <div className="bg-surface rounded-2xl p-4 shadow-card border-l-4 border-accent">
            <p className="text-[11px] text-muted font-semibold uppercase tracking-widest mb-2">Pending Reports</p>
            <p className="text-3xl font-bold text-on-surface">
              {loading ? '–' : pendingCount}
            </p>
          </div>
          <div className="bg-surface rounded-2xl p-4 shadow-card border-l-4 border-primary">
            <p className="text-[11px] text-muted font-semibold uppercase tracking-widest mb-2">Total Reports</p>
            <p className="text-3xl font-bold text-on-surface">
              {loading ? '–' : incidents.length}
            </p>
          </div>
        </div>

        {/* Notification banner — show latest unread, or a static default */}
        {firstUnread ? (
          <div className="bg-primary rounded-2xl p-4 mb-6 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <InformationCircleIcon className="w-5 h-5 text-on-primary/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-on-primary font-semibold text-sm mb-0.5">{firstUnread.title}</p>
              <p className="text-on-primary/80 text-sm leading-relaxed line-clamp-2">{firstUnread.message}</p>
              <button
                onClick={() => navigate('/residents/notifications')}
                className="text-on-primary/70 text-sm underline mt-1.5 hover:text-on-primary transition-colors"
              >
                View all notifications
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-primary rounded-2xl p-4 mb-6 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <InformationCircleIcon className="w-5 h-5 text-on-primary/60" />
            </div>
            <p className="text-on-primary/80 text-sm leading-relaxed">
              You're all caught up! No new notifications.
            </p>
          </div>
        )}

        {/* Map preview */}
        <h2 className="text-[18px] font-bold text-on-surface mb-3">My Recent Reports</h2>
        <div className="rounded-2xl overflow-hidden mb-4 relative h-52 sm:h-64 lg:h-72" style={{ isolation: 'isolate' }}>
          <MapContainer center={[14.7983, 120.9172]} zoom={16} style={{ width: '100%', height: '100%' }} zoomControl={false} attributionControl={false} scrollWheelZoom={false} dragging={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" maxZoom={20} />
          </MapContainer>
          <div className="absolute bottom-3 left-3 right-3" style={{ zIndex: 1000 }}>
            <div className="bg-white/95 rounded-full px-4 py-2.5 flex items-center justify-between shadow">
              <span className="text-sm font-semibold text-on-surface">Barangay Bolacan</span>
              <span className="text-sm font-semibold text-muted">Live View</span>
            </div>
          </div>
        </div>

        {/* Recent incidents from API */}
        {loading ? (
          <div className="bg-surface rounded-2xl shadow-card p-6 text-center text-sm text-muted">
            Loading your reports…
          </div>
        ) : recentTwo.length === 0 ? (
          <div className="bg-surface rounded-2xl shadow-card p-6 text-center">
            <p className="text-sm font-semibold text-on-surface mb-1">No reports yet</p>
            <p className="text-xs text-muted">Submit your first incident report to see it here.</p>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl shadow-card overflow-hidden divide-y divide-divider">
            {recentTwo.map((inc) => {
              const Icon = TYPE_ICON[inc.incident_type] ?? ExclamationCircleIcon
              const isActive = ACTIVE_STATUSES.has(inc.status)
              return (
                <Link
                  key={inc.id}
                  to="/residents/reports"
                  className="flex items-center gap-3 p-4 hover:bg-surface-low transition-colors"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-accent/10' : 'bg-surface-low'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-accent-dark' : 'text-muted'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface">{TYPE_LABEL[inc.incident_type] ?? inc.incident_type}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {inc.incident_number} · {timeAgo(inc.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      isActive ? 'bg-accent/10 text-accent-dark' : 'bg-surface-low text-muted'
                    }`}>
                      {inc.status.replace(/_/g, ' ')}
                    </span>
                    <ChevronRightIcon className="w-4 h-4 text-placeholder" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
        </div>
      </div>

      <BottomNav active="dashboard" />
    </div>
  )
}
