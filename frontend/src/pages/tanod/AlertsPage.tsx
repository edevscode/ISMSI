import { useState, useEffect, useCallback } from 'react'
import {
  ExclamationTriangleIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  FireIcon,
  BoltIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import TanodBottomNav from '../../components/TanodBottomNav'
import TanodTopNav from '../../components/TanodTopNav'
import { getNotifications, markRead, markAllRead, type Notification } from '../../api/notifications'

// ── Types ───────────────────────────────────────────────────────────────────
type FilterTab = 'all' | 'unread' | 'critical'

function resolveType(notif: Notification): 'community' | 'high-priority' | 'backup' | 'system' | 'fire' {
  if (notif.notification_type === 'INCIDENT_ASSIGNED') return 'high-priority'
  if (notif.notification_type === 'INCIDENT_NEARBY') return 'community'
  if (notif.notification_type === 'INCIDENT_UPDATE') return 'community'
  if (notif.notification_type === 'GENERAL') return 'system'
  return 'backup'
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Badge config ──────────────────────────────────────────────────────────
const BADGE_STYLES = {
  'community':     { bg: '#ffdad6', text: '#b91c1c', label: 'Community Alert' },
  'high-priority': { bg: '#b91c1c', text: '#ffffff', label: 'High Priority' },
  'backup':        { bg: '#e9e2a1', text: '#4c4817', label: 'Backup Status' },
  'system':        { bg: '#efeee9', text: '#434843', label: 'System Update' },
  'fire':          { bg: '#5f0004', text: '#ff594e', label: 'Fire Hazard' },
}

const LEFT_BORDER_TYPES = ['community', 'high-priority', 'fire']

// ── Icon ───────────────────────────────────────────────────────────────────
function AlertIcon({ type }: { type: keyof typeof BADGE_STYLES }) {
  const cfg = {
    'community':     { bg: '#ffdad6', iconColor: '#b91c1c', Icon: ExclamationTriangleIcon },
    'high-priority': { bg: '#1b3022', iconColor: '#ffffff', Icon: BoltIcon },
    'backup':        { bg: '#e9e2a1', iconColor: '#4c4817', Icon: UserPlusIcon },
    'system':        { bg: '#efeee9', iconColor: '#737973', Icon: Cog6ToothIcon },
    'fire':          { bg: '#b91c1c', iconColor: '#ffffff', Icon: FireIcon },
  }
  const { bg, iconColor, Icon } = cfg[type]
  return (
    <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
      <Icon className="w-5 h-5" style={{ color: iconColor }} />
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function TanodAlertsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch {
      // keep previous state on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15_000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleMarkRead = async (id: number) => {
    await markRead(id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
  }

  const handleMarkAllRead = async () => {
    await markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const filtered = notifications.filter((n) => {
    const type = resolveType(n)
    if (activeFilter === 'unread') return !n.is_read
    if (activeFilter === 'critical') return type === 'high-priority' || type === 'fire' || type === 'community'
    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="min-h-screen bg-tr-bg flex flex-col lg:pl-64">
      <TanodTopNav title="Field Responder" right="diamond" />

      <div className="flex-1 overflow-y-auto pb-28 lg:pb-8">
        <div className="px-4 sm:px-6 lg:px-8 pt-5 space-y-4 max-w-2xl mx-auto">

          {/* ── Page header ────────────────────────────────────── */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-hanken font-extrabold text-tr-on-surface text-[26px] sm:text-[28px] leading-tight">
                Alerts &amp; Notifications
              </h1>
              <p className="font-hanken text-[14px] text-tr-muted mt-0.5">
                Real-time mission updates and system status.
              </p>
            </div>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={fetchNotifications}
                className="p-2 rounded-full bg-tr-surface border border-tr-outline"
                aria-label="Refresh"
              >
                <ArrowPathIcon className="w-4 h-4 text-tr-muted" />
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-tr-primary-container border border-tr-primary-container rounded-full px-3 py-1.5 uppercase tracking-wider whitespace-nowrap"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* ── Filter tabs ──────────────────────────────────────── */}
          <div className="flex gap-0 rounded overflow-hidden" style={{ border: '1.5px solid #1b1c19' }}>
            {(['all', 'unread', 'critical'] as FilterTab[]).map((tab, idx) => {
              const isActive = activeFilter === tab
              const label = tab === 'unread'
                ? `UNREAD${unreadCount > 0 ? ` (${unreadCount})` : ''}`
                : tab.toUpperCase()
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className="flex-1 font-jetbrains text-[12px] font-bold uppercase tracking-[0.08em] transition-all"
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

          {/* ── Alert cards ──────────────────────────────────────── */}
          {loading ? (
            <div className="text-center text-tr-muted py-10 text-sm">Loading alerts…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-tr-muted py-10 text-sm">No alerts found.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((notif) => {
                const type = resolveType(notif)
                const badge = BADGE_STYLES[type]
                const hasRedBorder = LEFT_BORDER_TYPES.includes(type)
                const isAssignment = notif.notification_type === 'INCIDENT_ASSIGNED'

                return (
                  <div
                    key={notif.id}
                    className="bg-white rounded-lg overflow-hidden"
                    style={{
                      border: '1.5px solid #c3c8c1',
                      borderLeft: hasRedBorder ? '4px solid #b91c1c' : '1.5px solid #c3c8c1',
                      opacity: notif.is_read ? 0.7 : 1,
                    }}
                  >
                    <div className="px-4 sm:px-5 pt-4 pb-4">
                      {/* Row 1: badge + time + unread dot */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span
                          className="font-jetbrains text-[10px] font-bold uppercase tracking-[0.08em]"
                          style={{ background: badge.bg, color: badge.text, padding: '2px 7px', borderRadius: '2px' }}
                        >
                          {badge.label}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-jetbrains text-[10px] text-tr-muted tracking-[0.04em]">
                            {timeAgo(notif.created_at)}
                          </span>
                          {!notif.is_read && (
                            <div className="w-2 h-2 rounded-full bg-tr-critical shrink-0" />
                          )}
                        </div>
                      </div>

                      {/* Row 2: icon + title */}
                      <div className="flex items-start gap-3 mb-2">
                        <AlertIcon type={type} />
                        <div className="flex-1 min-w-0">
                          <p className="font-hanken font-extrabold text-tr-on-surface text-[16px] leading-snug">
                            {notif.title}
                          </p>
                        </div>
                      </div>

                      <p className="font-hanken text-[14px] text-tr-muted leading-relaxed mb-3">
                        {notif.message}
                      </p>

                      {/* Actions */}
                      {isAssignment && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleMarkRead(notif.id)}
                            className="flex-1 bg-tr-primary-container text-tr-on-primary font-hanken font-bold uppercase flex items-center justify-center rounded hover:opacity-90 active:opacity-80 transition-opacity"
                            style={{ minHeight: '40px', fontSize: '12px', letterSpacing: '0.1em' }}
                          >
                            Acknowledge
                          </button>
                          <button
                            type="button"
                            className="flex-1 bg-white border border-tr-on-surface text-tr-on-surface font-hanken font-bold uppercase flex items-center justify-center rounded hover:bg-tr-surface transition-colors"
                            style={{ minHeight: '40px', fontSize: '12px', letterSpacing: '0.1em' }}
                          >
                            Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <TanodBottomNav active="alerts" />
    </div>
  )
}
