import { Link } from 'react-router-dom'
import {
  Squares2X2Icon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { Squares2X2Icon as Squares2X2Solid } from '@heroicons/react/24/solid'

type NavKey = 'dashboard' | 'reports' | 'requests' | 'profile' | 'notifications'

const items: {
  key: NavKey
  label: string
  href: string
  Icon: React.ElementType
  ActiveIcon?: React.ElementType
}[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/residents/dashboard',         Icon: Squares2X2Icon, ActiveIcon: Squares2X2Solid },
  { key: 'reports',   label: 'Reports',   href: '/residents/reports',            Icon: DocumentTextIcon },
  { key: 'requests',  label: 'Requests',  href: '/residents/request-document',   Icon: ClipboardDocumentListIcon },
  { key: 'profile',   label: 'Profile',   href: '/residents/profile',            Icon: UserIcon },
]

export default function BottomNav({ active }: { active: NavKey }) {
  return (
    <nav
      className={[
        /* ── Mobile: fixed horizontal bottom bar ─── */
        'fixed bottom-0 left-0 right-0 z-30',
        'bg-surface border-t border-divider',
        'px-3 py-3 flex items-center justify-around',
        /* ── Desktop lg+: fixed left sidebar ─────── */
        'lg:top-0 lg:bottom-0 lg:right-auto lg:w-64',
        'lg:border-t-0 lg:border-r lg:border-divider',
        'lg:flex-col lg:items-stretch lg:justify-start',
        'lg:px-4 lg:pt-8 lg:pb-6',
      ].join(' ')}
    >
      {/* Sidebar branding header — desktop only */}
      <div className="hidden lg:flex lg:items-center lg:gap-3 lg:px-2 lg:mb-8 lg:pb-6 lg:border-b lg:border-divider">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <img src="/ismsi_brand_logo.png" alt="ISMSI" className="w-6 h-6 object-contain" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-on-surface text-[14px] leading-none">ISMSI Portal</p>
          <p className="text-[11px] text-muted mt-0.5">Resident Services</p>
        </div>
      </div>

      {/* Nav item list */}
      <div className="flex items-center justify-around w-full lg:flex-col lg:items-stretch lg:justify-start lg:gap-1">
        {items.map(({ key, label, href, Icon, ActiveIcon }) => {
          const isActive = key === active
          const Ico = isActive && ActiveIcon ? ActiveIcon : Icon
          return (
            <Link
              key={key}
              to={href}
              className="flex flex-col items-center lg:w-full"
            >
              {isActive ? (
                /* Active — pill on mobile, full-width row on desktop */
                <div className="flex items-center gap-1.5 bg-primary rounded-full px-4 py-2 lg:gap-3 lg:px-4 lg:py-3 lg:rounded-xl lg:w-full">
                  <Ico className="w-4 h-4 text-on-primary lg:w-5 lg:h-5 shrink-0" />
                  <span className="text-on-primary text-[12px] font-semibold lg:text-[14px]">{label}</span>
                </div>
              ) : (
                /* Inactive */
                <div className="flex flex-col items-center lg:flex-row lg:gap-3 lg:px-4 lg:py-3 lg:rounded-xl lg:hover:bg-surface-low lg:transition-colors lg:w-full">
                  <Ico className="w-5 h-5 text-muted shrink-0" />
                  <span className="text-[11px] text-muted font-medium mt-0.5 lg:mt-0 lg:text-[14px]">{label}</span>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
