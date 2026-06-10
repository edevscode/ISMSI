import { useState, useEffect, useCallback } from 'react'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  BellIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'
import TopNav from '../../components/TopNav'
import BottomNav from '../../components/BottomNav'
import { getNotifications, markRead, markAllRead, type Notification } from '../../api/notifications'

type TabKey = 'all' | 'unread' | 'alerts'

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

const ALERT_TYPES = new Set(['INCIDENT_ASSIGNED', 'INCIDENT_NEARBY', 'INCIDENT_UPDATE'])

interface CardConfig {
  Icon: React.ElementType
  iconBg: string
  iconColor: string
  borderLeft: string | null
  typeLabel: string
}

function cardConfig(type: string): CardConfig {
  switch (type) {
    case 'INCIDENT_NEARBY':
      return { Icon: ExclamationTriangleIcon, iconBg: 'bg-accent',   iconColor: 'text-on-primary', borderLeft: 'border-accent',   typeLabel: 'Nearby Incident' }
    case 'INCIDENT_ASSIGNED':
      return { Icon: BellIcon,                iconBg: 'bg-accent',   iconColor: 'text-on-primary', borderLeft: 'border-accent',   typeLabel: 'Incident Alert' }
    case 'INCIDENT_UPDATE':
      return { Icon: ArrowPathIcon,           iconBg: 'bg-primary',  iconColor: 'text-on-primary', borderLeft: null,              typeLabel: 'Update' }
    case 'DOCUMENT_UPDATE':
      return { Icon: DocumentTextIcon,        iconBg: 'bg-primary/10', iconColor: 'text-primary',  borderLeft: null,              typeLabel: 'Document' }
    case 'VERIFICATION_UPDATE':
      return { Icon: ShieldCheckIcon,         iconBg: 'bg-primary/10', iconColor: 'text-primary',  borderLeft: null,              typeLabel: 'Verification' }
    default:
      return { Icon: InformationCircleIcon,   iconBg: 'bg-surface-low', iconColor: 'text-muted',   borderLeft: null,              typeLabel: 'Notice' }
  }
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch {
      // keep previous
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    const id = setInterval(fetch, 15_000)
    return () => clearInterval(id)
  }, [fetch])

  const handleRead = async (id: number) => {
    await markRead(id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
  }

  const handleReadAll = async () => {
    await markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.is_read
    if (activeTab === 'alerts') return ALERT_TYPES.has(n.notification_type)
    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="min-h-screen bg-background flex flex-col lg:pl-64">
      <TopNav title="Notifications" showBack />

      <div className="flex-1 px-5 sm:px-6 lg:px-8 pt-5 pb-10 lg:pb-8 overflow-y-auto space-y-4">
        <div className="max-w-2xl mx-auto space-y-4">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['all', 'unread', 'alerts'] as TabKey[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface text-muted border border-divider hover:bg-surface-low'
                }`}
              >
                {tab === 'unread' && unreadCount > 0
                  ? `Unread (${unreadCount})`
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={fetch} className="p-2 rounded-full bg-surface border border-divider" aria-label="Refresh">
              <ArrowPathIcon className="w-4 h-4 text-muted" />
            </button>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleReadAll}
                className="text-xs font-semibold text-accent-dark border border-accent/30 rounded-full px-3 py-2"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="text-center text-sm text-muted py-10">Loading notifications…</div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface rounded-2xl shadow-card p-8 text-center">
            <BellIcon className="w-10 h-10 text-divider mx-auto mb-3" />
            <p className="text-sm font-semibold text-on-surface mb-1">No notifications</p>
            <p className="text-xs text-muted">You're all caught up.</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const cfg = cardConfig(notif.notification_type)
            const isUrgent = ALERT_TYPES.has(notif.notification_type)
            return (
              <div
                key={notif.id}
                className={`bg-surface rounded-2xl shadow-card px-4 pt-4 pb-4 transition-opacity ${notif.is_read ? 'opacity-60' : ''} ${cfg.borderLeft ? `border-l-4 ${cfg.borderLeft}` : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                    <cfg.Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted font-medium">{cfg.typeLabel}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-muted">{timeAgo(notif.created_at)}</span>
                        {!notif.is_read && <div className="w-2 h-2 rounded-full bg-accent" />}
                      </div>
                    </div>
                    <h3 className="text-[15px] font-bold text-on-surface leading-snug mb-1">
                      {notif.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {notif.message}
                    </p>

                    {isUrgent && !notif.is_read && (
                      <div className="flex gap-3 mt-4">
                        <button
                          type="button"
                          onClick={() => handleRead(notif.id)}
                          className="flex-1 bg-accent text-on-primary text-sm font-semibold rounded-lg py-3 hover:opacity-90 transition-opacity"
                        >
                          Acknowledge
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRead(notif.id)}
                          className="flex-1 border border-outline text-sm font-semibold text-on-surface rounded-lg py-3 hover:bg-surface-low transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}

                    {!isUrgent && !notif.is_read && (
                      <button
                        type="button"
                        onClick={() => handleRead(notif.id)}
                        className="mt-2 text-xs text-muted hover:text-on-surface transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Safety banner */}
        <div className="bg-primary rounded-2xl p-5 relative overflow-hidden">
          <ArrowTrendingUpIcon className="absolute -bottom-3 right-2 w-32 h-32 text-on-primary/10" aria-hidden="true" />
          <div className="relative z-10">
            <h3 className="font-bold text-on-primary text-[18px] mb-1">Stay Informed</h3>
            <p className="text-sm text-on-primary/70 leading-relaxed mb-5">
              You'll be notified automatically when your incident reports are updated.
            </p>
          </div>
        </div>
        </div>
      </div>

      <BottomNav active="notifications" />
    </div>
  )
}
