import { useNavigate } from 'react-router-dom'
import {
  Squares2X2Icon,
  ExclamationTriangleIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BellIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export type AdminNavKey =
  | 'dashboard'
  | 'incidents'
  | 'dispatch'
  | 'cases'
  | 'verification'
  | 'documents'
  | 'residents'
  | 'notifications'
  | 'analytics'
  | 'settings'

interface Props {
  active: AdminNavKey
  /** Mobile drawer open state */
  open?: boolean
  /** Called when the user closes the drawer on mobile */
  onClose?: () => void
}

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" }

const NAV_ITEMS: { key: AdminNavKey; label: string; Icon: React.ElementType; route: string }[] = [
  { key: 'dashboard',     label: 'Dashboard',            Icon: Squares2X2Icon,            route: '/admin/dashboard'             },
  { key: 'incidents',     label: 'Incident Center',       Icon: ExclamationTriangleIcon,   route: '/admin/incident-center'       },
  { key: 'dispatch',      label: 'Dispatch Management',   Icon: MapPinIcon,                route: '/admin/dispatch-management'   },
  { key: 'cases',         label: 'Case Management',       Icon: ClipboardDocumentListIcon, route: '/admin/case-management'       },
  { key: 'verification',  label: 'Resident Verification', Icon: ShieldCheckIcon,           route: '/admin/resident-verification' },
  { key: 'documents',     label: 'Document Requests',     Icon: DocumentTextIcon,          route: '/admin/document-requests'     },
  { key: 'residents',     label: 'Residents',             Icon: UserGroupIcon,             route: '/admin/residents'             },
  { key: 'notifications', label: 'Notifications',         Icon: BellIcon,                  route: '/admin/notifications'         },
  { key: 'analytics',     label: 'Analytics',             Icon: ChartBarIcon,              route: '/admin/analytics'             },
  { key: 'settings',      label: 'Settings',              Icon: Cog6ToothIcon,             route: '/admin/settings'              },
]

export default function AdminSidebar({ active, open = false, onClose }: Props) {
  const navigate = useNavigate()

  const handleNav = (route: string) => {
    navigate(route)
    onClose?.()
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          /* ── Base: fixed on mobile so it overlays content ── */
          'fixed top-0 left-0 bottom-0 z-40 flex flex-col transition-transform duration-200',
          /* Mobile: hide/show via translate */
          open ? 'translate-x-0' : '-translate-x-full',
          /* Desktop: always visible, part of flex layout */
          'lg:relative lg:translate-x-0 lg:z-auto lg:shrink-0',
        ].join(' ')}
        style={{ width: '220px', background: '#1b1c1c', borderRight: '1px solid #434843' }}
      >
        {/* Brand */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #434843', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#e4e2e1', fontWeight: 700, fontSize: '28px', letterSpacing: '-0.02em', lineHeight: 1 }}>
              ISMSI
            </div>
            <div style={{ ...MONO, color: '#c3cc8c', fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginTop: '4px' }}>
              Command Center
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded hover:bg-cc-surface transition-colors"
            aria-label="Close sidebar"
          >
            <XMarkIcon style={{ width: '18px', height: '18px', color: '#8d928c' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {NAV_ITEMS.map(({ key, label, Icon, route }) => {
            const isActive = key === active
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleNav(route)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '11px',
                  padding: '9px 20px', position: 'relative', textAlign: 'left',
                  background: isActive ? '#252626' : 'transparent',
                  border: 'none', cursor: 'pointer',
                }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#b4cdb8', borderRadius: '0 2px 2px 0' }} />
                )}
                <Icon style={{ width: '17px', height: '17px', color: isActive ? '#b4cdb8' : '#8d928c', flexShrink: 0 }} />
                <span style={{ fontSize: '13.5px', fontWeight: isActive ? 600 : 400, color: isActive ? '#e4e2e1' : '#c3c8c1' }}>
                  {label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* User card */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid #434843', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#252626', border: '1px solid #434843', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            <UserCircleIcon style={{ width: '24px', height: '24px', color: '#8d928c' }} />
          </div>
          <div>
            <div style={{ color: '#e4e2e1', fontSize: '13px', fontWeight: 600 }}>Admin Unit 01</div>
            <div style={{ ...MONO, color: '#c3cc8c', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '1px' }}>Authorized</div>
          </div>
        </div>
      </aside>
    </>
  )
}
