import { useState } from 'react'
import {
  StarIcon,
  ShieldCheckIcon,
  BellIcon,
  ServerStackIcon,
  Cog6ToothIcon,
  PlusIcon,
  FireIcon,
  UserGroupIcon,
  PlusCircleIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'
import AdminSidebar from '../../components/AdminSidebar'
import AdminTopBar from '../../components/AdminTopBar'

// ── Data ───────────────────────────────────────────────────────────────────

type SettingsSection = 'incidents' | 'clearance' | 'alerts' | 'config'

const SETTINGS_NAV: { key: SettingsSection; label: string; Icon: React.ElementType }[] = [
  { key: 'incidents', label: 'Incident Logic',   Icon: StarIcon         },
  { key: 'clearance', label: 'Clearance Types',  Icon: ShieldCheckIcon  },
  { key: 'alerts',    label: 'Admin Alerts',     Icon: BellIcon         },
  { key: 'config',    label: 'System Config',    Icon: ServerStackIcon  },
]

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

const CATEGORIES = [
  { id: 'FIRE_01',  name: 'Fire & Life Safety',  priority: 'CRITICAL' as Priority, response: '04:30 min', instances: 12, Icon: FireIcon        },
  { id: 'LAW_02',   name: 'Public Disorder',     priority: 'MEDIUM'   as Priority, response: '12:00 min', instances: 45, Icon: UserGroupIcon   },
  { id: 'EMS_03',   name: 'Emergency Medical',   priority: 'HIGH'     as Priority, response: '06:00 min', instances: 28, Icon: PlusCircleIcon  },
  { id: 'UTIL_04',  name: 'Utility Failure',     priority: 'LOW'      as Priority, response: '24:00 hr',  instances:  5, Icon: BoltIcon        },
]

const PRIORITY_STYLE: Record<Priority, { bg: string; color: string }> = {
  CRITICAL: { bg: '#7f1d1d', color: '#fca5a5' },
  HIGH:     { bg: '#7c2d12', color: '#fdba74' },
  MEDIUM:   { bg: '#434b18', color: '#c3cc8c' },
  LOW:      { bg: '#252626', color: '#6b7280' },
}

// ── Style helpers ───────────────────────────────────────────────────────────

const MONO: React.CSSProperties  = { fontFamily: "'JetBrains Mono', monospace" }
const INTER: React.CSSProperties = { fontFamily: 'Inter, sans-serif' }
const LABEL: React.CSSProperties = { ...MONO, fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#8d928c' }

// ── Main page ───────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('incidents')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#131313', overflow: 'hidden', ...INTER }}>

      <AdminSidebar active="settings" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        <AdminTopBar
          searchPlaceholder="Global system search..."
          onMenuClick={() => setSidebarOpen(true)}
          midSlot={
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid #434843', paddingLeft: '14px' }}>
              <Cog6ToothIcon style={{ width: '16px', height: '16px', color: '#8d928c' }} />
              <span style={{ color: '#e4e2e1', fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                System Configuration
              </span>
            </div>
          }
        />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ── Settings sub-nav ── */}
          <div className="hidden lg:flex" style={{ width: '220px', background: '#1b1c1c', borderRight: '1px solid #434843', flexDirection: 'column', flexShrink: 0 }}>

            <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
              {SETTINGS_NAV.map(({ key, label, Icon }) => {
                const isActive = key === activeSection
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveSection(key)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 16px', background: isActive ? '#252626' : 'transparent',
                      border: 'none', cursor: 'pointer', position: 'relative',
                    }}
                  >
                    {isActive && (
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#b4cdb8', borderRadius: '0 2px 2px 0' }} />
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon style={{ width: '16px', height: '16px', color: isActive ? '#b4cdb8' : '#8d928c', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400, color: isActive ? '#e4e2e1' : '#c3c8c1', ...INTER }}>
                        {label}
                      </span>
                    </div>
                    <span style={{ color: '#434843', fontSize: '14px' }}>›</span>
                  </button>
                )
              })}
            </div>

            {/* System health widget */}
            <div style={{ padding: '14px 16px', borderTop: '1px solid #434843' }}>
              <div style={{ ...LABEL, marginBottom: '10px' }}>System Health</div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#c3c8c1', fontSize: '13px', fontWeight: 600 }}>API Gateway</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ ...MONO, fontSize: '10px', fontWeight: 700, color: '#22c55e', letterSpacing: '0.07em' }}>ACTIVE</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: '#c3c8c1', fontSize: '13px', fontWeight: 600 }}>Storage</span>
                  <span style={{ ...MONO, fontSize: '11px', color: '#ef4444', fontWeight: 700 }}>92%</span>
                </div>
                <div style={{ height: '5px', background: '#252626', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '92%', background: '#ef4444', borderRadius: '999px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Main settings content ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

            {/* Dark terrain map background */}
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}
              viewBox="0 0 800 600"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <rect width="800" height="600" fill="#0b0c0b" />
              {[0,50,100,150,200,250,300,350,400].map((y) => (
                <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#1e201e" strokeWidth="1.5" />
              ))}
              {[0,60,120,180,240,300,360,420,480,540,600,660,720,780].map((x) => (
                <line key={x} x1={x} y1="0" x2={x} y2="600" stroke="#1e201e" strokeWidth="1.5" />
              ))}
              <path d="M 0,200 Q 200,150 400,200 Q 600,250 800,180" fill="none" stroke="#282928" strokeWidth="4" />
              <path d="M 0,350 Q 250,300 500,350 Q 650,380 800,320" fill="none" stroke="#282928" strokeWidth="4" />
              <line x1="300" y1="0" x2="300" y2="600" stroke="#282928" strokeWidth="5" />
              <line x1="0" y1="300" x2="800" y2="300" stroke="#282928" strokeWidth="5" />
            </svg>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
              <div style={{ padding: '18px 24px' }}>

                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h2 style={{ color: '#e4e2e1', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
                    Incident Categories & Priorities
                  </h2>
                  <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1b3022', border: '1px solid #364c3c', borderRadius: '4px', padding: '7px 14px', color: '#b4cdb8', fontSize: '13px', fontWeight: 600, cursor: 'pointer', ...INTER }}>
                    <PlusIcon style={{ width: '14px', height: '14px' }} />
                    New Category
                  </button>
                </div>

                {/* Category cards 2×2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '12px', marginBottom: '24px' }}>
                  {CATEGORIES.map(({ id, name, priority, response, instances, Icon }) => {
                    const ps = PRIORITY_STYLE[priority]
                    return (
                      <div key={id} style={{ background: '#1b1c1c', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                          <div style={{ width: '38px', height: '38px', background: '#252626', border: '1px solid #434843', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon style={{ width: '20px', height: '20px', color: '#8d928c' }} />
                          </div>
                          <div>
                            <div style={{ color: '#e4e2e1', fontSize: '15px', fontWeight: 700, lineHeight: 1.25 }}>{name}</div>
                            <div style={{ ...MONO, fontSize: '10px', color: '#8d928c', letterSpacing: '0.06em', marginTop: '1px' }}>CAT-ID: {id}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#8d928c', fontSize: '12px' }}>Default Priority</span>
                            <span style={{ ...MONO, background: ps.bg, color: ps.color, fontSize: '10px', fontWeight: 700, padding: '2px 9px', borderRadius: '3px', letterSpacing: '0.07em' }}>
                              {priority}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#8d928c', fontSize: '12px' }}>Response Target</span>
                            <span style={{ ...MONO, fontSize: '12px', fontWeight: 700, color: '#c3c8c1' }}>{response}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#8d928c', fontSize: '12px' }}>Active Instances</span>
                            <span style={{ ...MONO, fontSize: '12px', fontWeight: 700, color: '#b4cdb8' }}>
                              {instances} <span style={{ color: '#8d928c', fontWeight: 400 }}>Today</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── Commit panel ── */}
            <div style={{ background: 'rgba(27,28,28,0.95)', border: '1px solid #434843', borderRadius: '4px', margin: '0 24px 20px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', position: 'relative', zIndex: 1, flexShrink: 0 }}>
              <div>
                <div style={{ ...LABEL, marginBottom: '4px' }}>Last Configuration Save</div>
                <div style={{ ...MONO, fontSize: '16px', fontWeight: 700, color: '#e4e2e1', lineHeight: 1.3 }}>
                  2023-11-24<br />14:22:09
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...LABEL, marginBottom: '4px' }}>Revision Hash</div>
                <div style={{ ...MONO, fontSize: '14px', fontWeight: 700, color: '#c3cc8c', letterSpacing: '0.04em' }}>
                  SHA-256: 8f2a...c91e
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button type="button" style={{ background: '#252626', border: '1px solid #434843', borderRadius: '4px', padding: '10px 16px', color: '#c3c8c1', fontSize: '13px', fontWeight: 600, cursor: 'pointer', ...INTER }}>
                  Discard
                </button>
                <button type="button" style={{ background: '#1b3022', border: '1px solid #364c3c', borderRadius: '4px', padding: '10px 18px', color: '#b4cdb8', fontSize: '13px', fontWeight: 700, cursor: 'pointer', ...INTER }}>
                  Commit Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
