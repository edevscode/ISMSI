import { useState } from 'react'
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
} from '@heroicons/react/24/outline'
import AdminSidebar from '../../components/AdminSidebar'
import AdminTopBar from '../../components/AdminTopBar'

// ── Data ───────────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Avg. Response Time', value: '08:42', sub: '↓ -12% from prev. month', subColor: '#22c55e', Icon: ClockIcon           },
  { label: 'Resolution Rate',    value: '94.2%', sub: '↑ +2.4% target met',       subColor: '#22c55e', Icon: CheckCircleIcon      },
  { label: 'Active Incidents',   value: '14',    sub: 'High Priority: 3',          subColor: '#f97316', Icon: ExclamationTriangleIcon },
  { label: 'Document Volume',    value: '1,402', sub: 'Processed today: 124',     subColor: '#8d928c', Icon: DocumentTextIcon    },
]

const DISTRIBUTION = [
  { label: 'Emergency Response',    pct: 42, color: '#ef4444' },
  { label: 'Nuisance / Noise',      pct: 28, color: '#c3cc8c' },
  { label: 'Infrastructure Repairs',pct: 18, color: '#b4cdb8' },
  { label: 'Administrative',        pct: 12, color: '#819986' },
]

const SECTORS = [
  { id: 'DISTRICT_01', avgTime: '06:12m', coverage: 72, trend: 'up'   },
  { id: 'DISTRICT_02', avgTime: '09:45m', coverage: 50, trend: 'flat' },
  { id: 'DISTRICT_03', avgTime: '12:20m', coverage: 28, trend: 'down' },
]

const BAR_VALUES = [68, 82, 74, 95, 88, 102, 115, 98, 110, 124]

// ── Style helpers ───────────────────────────────────────────────────────────

const MONO: React.CSSProperties  = { fontFamily: "'JetBrains Mono', monospace" }
const INTER: React.CSSProperties = { fontFamily: 'Inter, sans-serif' }
const LABEL: React.CSSProperties = { ...MONO, fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#8d928c' }

// ── Main page ───────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#131313', overflow: 'hidden', ...INTER }}>

      <AdminSidebar active="analytics" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        <AdminTopBar
          searchPlaceholder="Search analytics..."
          onMenuClick={() => setSidebarOpen(true)}
          rightSlot={
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1b1c1c', border: '1px solid #434843', borderRadius: '4px', padding: '5px 10px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#b4cdb8' }} />
              <span style={{ ...MONO, fontSize: '10px', fontWeight: 700, color: '#b4cdb8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Live Feed: Active
              </span>
            </div>
          }
        />

        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* ── Page header ── */}
          <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #434843', background: '#1f2020', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                <SparklesIcon style={{ width: '14px', height: '14px', color: '#8d928c' }} />
                <span style={{ ...MONO, fontSize: '10px', fontWeight: 700, color: '#8d928c', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                  System Intelligence
                </span>
              </div>
              <div style={{ color: '#e4e2e1', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '4px' }}>
                Community Analytics Overview
              </div>
              <div style={{ color: '#8d928c', fontSize: '12.5px', maxWidth: '560px' }}>
                Visualizing district performance metrics, response efficiency, and citizen engagement volume for the current fiscal quarter.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#252626', border: '1px solid #434843', borderRadius: '4px', padding: '7px 12px', color: '#c3c8c1', fontSize: '12px', cursor: 'pointer', ...INTER }}>
                <CalendarDaysIcon style={{ width: '13px', height: '13px' }} />
                Last 30 Days
              </button>
              <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1b3022', border: '1px solid #364c3c', borderRadius: '4px', padding: '7px 12px', color: '#b4cdb8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', ...INTER }}>
                <ArrowDownTrayIcon style={{ width: '13px', height: '13px' }} />
                Export Report
              </button>
            </div>
          </div>

          <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '10px' }}>
              {STATS.map(({ label, value, sub, subColor, Icon }) => (
                <div key={label} style={{ background: '#1b1c1c', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ ...LABEL }}>{label}</div>
                    <Icon style={{ width: '18px', height: '18px', color: '#434843' }} />
                  </div>
                  <div style={{ ...MONO, fontSize: '36px', fontWeight: 700, color: '#e4e2e1', lineHeight: 1, marginBottom: '6px' }}>
                    {value}
                  </div>
                  <div style={{ fontSize: '11px', color: subColor }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* ── Chart row ── */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px]" style={{ gap: '12px' }}>

              {/* Monthly Incident Trends line chart */}
              <div style={{ background: '#1b1c1c', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ color: '#e4e2e1', fontSize: '14px', fontWeight: 700 }}>Monthly Incident Trends</span>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#b4cdb8' }} />
                      <span style={{ fontSize: '11px', color: '#8d928c' }}>Reported</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#c3cc8c' }} />
                      <span style={{ fontSize: '11px', color: '#8d928c' }}>Resolved</span>
                    </div>
                  </div>
                </div>

                <div style={{ position: 'relative', height: '200px' }}>
                  <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 540 200" preserveAspectRatio="none" aria-hidden="true">
                    {/* Grid lines + Y labels */}
                    {[0, 50, 100, 150].map((val, i) => {
                      const y = 180 - (val / 150) * 160
                      return (
                        <g key={val}>
                          <line x1="40" y1={y} x2="530" y2={y} stroke="#252626" strokeWidth="1" />
                          <text x="32" y={y + 4} fontSize="10" fill="#434843" textAnchor="end" fontFamily="JetBrains Mono">{val}</text>
                        </g>
                      )
                    })}

                    {/* X axis labels */}
                    {['JAN','FEB','MAR','APR','MAY','JUN'].map((m, i) => (
                      <text key={m} x={40 + i * 98} y="198" fontSize="10" fill="#434843" textAnchor="middle" fontFamily="Inter">{m}</text>
                    ))}

                    {/* Reported line (green) — peaks around MAY */}
                    <polyline
                      points="40,148 138,140 236,118 334,78 432,42 530,72"
                      fill="none" stroke="#b4cdb8" strokeWidth="2.5" strokeLinejoin="round"
                    />
                    {/* Resolved line (olive dashed) — slightly lower */}
                    <polyline
                      points="40,158 138,155 236,138 334,105 432,70 530,88"
                      fill="none" stroke="#c3cc8c" strokeWidth="2" strokeDasharray="5,3" strokeLinejoin="round"
                    />

                    {/* Area fills */}
                    <path
                      d="M 40,148 138,140 236,118 334,78 432,42 530,72 L 530,180 40,180 Z"
                      fill="#b4cdb8" opacity="0.06"
                    />
                    <path
                      d="M 40,158 138,155 236,138 334,105 432,70 530,88 L 530,180 40,180 Z"
                      fill="#c3cc8c" opacity="0.06"
                    />

                    {/* Dots on reported */}
                    {[[40,148],[138,140],[236,118],[334,78],[432,42],[530,72]].map(([x,y],i) => (
                      <circle key={i} cx={x} cy={y} r="3.5" fill="#b4cdb8" stroke="#131313" strokeWidth="1.5" />
                    ))}
                  </svg>
                </div>
              </div>

              {/* Incident Distribution */}
              <div style={{ background: '#1b1c1c', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '16px' }}>
                <div style={{ color: '#e4e2e1', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>
                  Incident Distribution
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {DISTRIBUTION.map(({ label, pct, color }) => (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ color: '#c3c8c1', fontSize: '12px' }}>{label}</span>
                        <span style={{ ...MONO, fontSize: '11px', fontWeight: 700, color: '#8d928c' }}>{pct}%</span>
                      </div>
                      <div style={{ height: '5px', background: '#252626', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live load note */}
                <div style={{ marginTop: '18px', background: '#131313', border: '1px solid #252626', borderRadius: '4px', padding: '10px 12px' }}>
                  <div style={{ ...LABEL, marginBottom: '4px' }}>Live Load</div>
                  <div style={{ color: '#8d928c', fontSize: '12px', lineHeight: 1.55 }}>
                    82% of dispatch units currently committed.
                  </div>
                </div>
              </div>
            </div>

            {/* ── Bottom row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '12px' }}>

              {/* Response Efficiency by Sector */}
              <div style={{ background: '#1b1c1c', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '16px' }}>
                <div style={{ color: '#e4e2e1', fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>
                  Response Efficiency by Sector
                </div>
                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.4fr 0.8fr', marginBottom: '6px' }}>
                  {['Sector ID', 'Avg Time', 'Coverage', 'Trend'].map((h) => (
                    <div key={h} style={{ ...LABEL }}>{h}</div>
                  ))}
                </div>
                {SECTORS.map(({ id, avgTime, coverage, trend }) => {
                  const TrendIcon = trend === 'up' ? ArrowTrendingUpIcon : trend === 'down' ? ArrowTrendingDownIcon : MinusIcon
                  const trendColor = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#8d928c'
                  const barColor = trend === 'up' ? '#b4cdb8' : trend === 'down' ? '#ef4444' : '#c3cc8c'
                  return (
                    <div key={id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.4fr 0.8fr', alignItems: 'center', padding: '9px 0', borderTop: '1px solid #252626' }}>
                      <span style={{ ...MONO, fontSize: '11px', color: '#c3cc8c', letterSpacing: '0.04em' }}>{id}</span>
                      <span style={{ ...MONO, fontSize: '12px', color: '#e4e2e1', fontWeight: 600 }}>{avgTime}</span>
                      <div>
                        <div style={{ height: '5px', background: '#252626', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${coverage}%`, background: barColor, borderRadius: '999px' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <TrendIcon style={{ width: '16px', height: '16px', color: trendColor }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Document Request Volume bar chart */}
              <div style={{ background: '#1b1c1c', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ color: '#e4e2e1', fontSize: '14px', fontWeight: 700 }}>Document Request Volume</span>
                  <span style={{ ...MONO, fontSize: '10px', color: '#8d928c', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Daily Aggregate</span>
                </div>

                <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', gap: '5px', padding: '0 0 24px' }}>
                  {BAR_VALUES.map((v, i) => {
                    const maxH = 130
                    const h = (v / 130) * maxH
                    const isLast = i === BAR_VALUES.length - 1
                    const xLabels = ['12 JUL', '', '', '', '', '18 JUL', '', '', '', '24 JUL']
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '100%', height: `${h}px`, background: isLast ? '#b4cdb8' : '#1b3022', borderRadius: '2px 2px 0 0', transition: 'background 0.15s' }} />
                        {xLabels[i] && (
                          <span style={{ ...MONO, fontSize: '9px', color: '#434843', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
                            {xLabels[i]}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* System build footer */}
            <div style={{ ...MONO, fontSize: '10px', color: '#2a2a2a', letterSpacing: '0.09em', textTransform: 'uppercase', textAlign: 'left' }}>
              System Build V4.2.0-Stable
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
