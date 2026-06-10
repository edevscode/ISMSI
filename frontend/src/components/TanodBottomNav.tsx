import { Link } from 'react-router-dom'
import { ClockIcon, BellIcon, UserIcon, BoltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { HomeIcon as HomeSolid } from '@heroicons/react/24/solid'
import { HomeIcon } from '@heroicons/react/24/outline'

export type TanodNavKey = 'home' | 'incidents' | 'history' | 'alerts' | 'profile'

interface NavItem {
  key: TanodNavKey
  label: string
  href: string
  Icon: React.ElementType
  ActiveIcon?: React.ElementType
  hasDot?: boolean
}

const ITEMS: NavItem[] = [
  { key: 'home',      label: 'Home',      href: '/tanod/home',      Icon: HomeIcon,  ActiveIcon: HomeSolid },
  { key: 'incidents', label: 'Incidents', href: '/tanod/incidents', Icon: BoltIcon },
  { key: 'history',   label: 'History',   href: '/tanod/history',   Icon: ClockIcon },
  { key: 'alerts',    label: 'Alerts',    href: '/tanod/alerts',    Icon: BellIcon,  hasDot: true },
  { key: 'profile',   label: 'Profile',   href: '/tanod/profile',   Icon: UserIcon },
]

export default function TanodBottomNav({ active }: { active: TanodNavKey }) {
  return (
    <nav
      className={[
        /* ── Mobile: fixed horizontal bottom bar ─── */
        'fixed bottom-0 left-0 right-0 z-30',
        'bg-tr-bg border-t border-tr-divider',
        'px-3 py-3 flex items-center justify-around',
        /* ── Desktop lg+: fixed left sidebar ─────── */
        'lg:top-0 lg:bottom-0 lg:right-auto lg:w-64',
        'lg:border-t-0 lg:border-r lg:border-tr-divider',
        'lg:flex-col lg:items-stretch lg:justify-start',
        'lg:px-4 lg:pt-8 lg:pb-6',
      ].join(' ')}
    >
      {/* Sidebar branding header — desktop only */}
      <div className="hidden lg:flex lg:items-center lg:gap-3 lg:px-2 lg:mb-8 lg:pb-6 lg:border-b lg:border-tr-divider">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-tr-primary-container shrink-0">
          <ShieldCheckIcon className="w-5 h-5 text-tr-on-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-hanken font-extrabold text-tr-on-surface text-[13px] uppercase tracking-tight leading-none">
            Field Responder
          </p>
          <p className="font-jetbrains text-[9px] text-tr-muted uppercase tracking-[0.1em] mt-0.5">
            ISMSI System
          </p>
        </div>
      </div>

      {/* Nav item list */}
      <div className="flex items-center justify-around w-full lg:flex-col lg:items-stretch lg:justify-start lg:gap-1">
        {ITEMS.map(({ key, label, href, Icon, ActiveIcon, hasDot }) => {
          const isActive = key === active
          const Ico = isActive && ActiveIcon ? ActiveIcon : Icon
          return (
            <Link
              key={key}
              to={href}
              className="flex flex-col items-center min-w-0 lg:w-full"
            >
              {isActive ? (
                /* Active state */
                <div className="flex items-center gap-1.5 bg-tr-primary-container rounded-lg px-3.5 py-2 lg:gap-3 lg:px-4 lg:py-3 lg:w-full">
                  <Ico className="w-4 h-4 text-tr-on-primary lg:w-5 lg:h-5 shrink-0" />
                  <span className="font-hanken text-[12px] font-bold text-tr-on-primary lg:text-[14px]">
                    {label}
                  </span>
                </div>
              ) : (
                /* Inactive state */
                <div className="flex flex-col items-center gap-0.5 relative lg:flex-row lg:gap-3 lg:px-4 lg:py-3 lg:rounded-lg lg:hover:bg-tr-surface lg:transition-colors lg:w-full">
                  <div className="relative shrink-0">
                    <Ico className="w-5 h-5 text-tr-muted" />
                    {hasDot && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-tr-critical" />
                    )}
                  </div>
                  <span className="font-hanken text-[11px] text-tr-muted font-medium lg:text-[14px]">
                    {label}
                  </span>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
