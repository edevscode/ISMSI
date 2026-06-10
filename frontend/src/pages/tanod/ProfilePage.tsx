import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheckIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  ArchiveBoxIcon,
  PhoneIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightEndOnRectangleIcon,
} from '@heroicons/react/24/outline'
import TanodBottomNav from '../../components/TanodBottomNav'
import TanodTopNav from '../../components/TanodTopNav'

// ── Main page ──────────────────────────────────────────────────────────────
export default function TanodProfilePage() {
  const navigate = useNavigate()
  const [available, setAvailable] = useState(true)

  const MENU_ITEMS = [
    { label: 'Duty Schedule',       Icon: CalendarDaysIcon },
    { label: 'Equipment Inventory', Icon: ArchiveBoxIcon   },
    { label: 'Security Settings',   Icon: ShieldCheckIcon  },
    { label: 'Contact Admin',       Icon: PhoneIcon        },
  ]

  return (
    <div className="min-h-screen bg-tr-bg flex flex-col lg:pl-64">

      <TanodTopNav title="Responder Profile" right="diamond" />

      <div className="flex-1 overflow-y-auto pb-28 lg:pb-8">
        <div className="px-4 sm:px-6 lg:px-8 pt-5 space-y-4 max-w-2xl mx-auto">

          {/* ── Profile card ────────────────────────────────────── */}
          <div
            className="bg-tr-surface rounded-lg px-4 sm:px-6 py-5"
            style={{ border: '1.5px solid #c3c8c1' }}
          >
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div
                  className="w-[116px] h-[116px] rounded-xl overflow-hidden flex items-center justify-center"
                  style={{ background: '#efeee9', border: '2px solid #c3c8c1' }}
                >
                  <UserCircleIcon className="w-full h-full text-tr-muted/40" />
                </div>
                <button
                  type="button"
                  className="absolute bottom-1.5 right-1.5 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-tr-surface transition-colors"
                  style={{ border: '1px solid #c3c8c1' }}
                >
                  <Cog6ToothIcon className="w-4 h-4 text-tr-muted" />
                </button>
              </div>
            </div>

            {/* Name + badge */}
            <div className="text-center mb-3">
              <h2 className="font-hanken font-extrabold text-tr-on-surface text-[22px]">
                Sgt. Ricardo Dalisay
              </h2>
              <p className="font-jetbrains text-[11px] text-tr-muted uppercase tracking-[0.1em] mt-0.5">
                Badge ID: #9932-Delta
              </p>
            </div>

            <div className="border-t border-tr-divider mb-4" />

            {/* Duty status toggle */}
            <div className="flex items-center justify-between gap-3">
              <p className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] text-tr-muted leading-tight">
                Current Duty<br />Status
              </p>
              <button
                type="button"
                onClick={() => setAvailable((v) => !v)}
                className="relative w-12 h-6 rounded-full transition-colors shrink-0"
                style={{ background: available ? '#1b3022' : '#c3c8c1' }}
                aria-checked={available}
                role="switch"
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                  style={{ left: available ? 'calc(100% - 1.375rem)' : '2px' }}
                />
              </button>
              <span className="font-jetbrains text-[12px] font-bold uppercase tracking-[0.1em] text-tr-on-surface shrink-0">
                {available ? 'Available' : 'Off Duty'}
              </span>
            </div>
          </div>

          {/* ── Performance stats — 3-up grid on sm+ ────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Resolved Incidents */}
            <div
              className="rounded-lg px-4 py-4 flex items-center justify-between sm:flex-col sm:items-start sm:gap-2"
              style={{ background: '#1b3022' }}
            >
              <div>
                <p className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] text-tr-on-primary/60 mb-1">
                  Resolved Incidents
                </p>
                <p className="font-hanken font-extrabold text-tr-on-primary text-[36px] leading-none">
                  142
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-tr-on-primary/40 sm:self-end" />
            </div>

            {/* Avg Response */}
            <div
              className="bg-white rounded-lg px-4 py-4 flex items-center justify-between sm:flex-col sm:items-start sm:gap-2"
              style={{ border: '1.5px solid #c3c8c1' }}
            >
              <div>
                <p className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] text-tr-muted mb-1">
                  Avg Response
                </p>
                <p className="font-hanken font-extrabold text-tr-on-surface text-[36px] leading-none">
                  4.5<span className="text-[22px]">m</span>
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-tr-muted/40 sm:self-end" />
            </div>

            {/* Weekly Duty */}
            <div
              className="rounded-lg px-4 py-4 flex items-center justify-between sm:flex-col sm:items-start sm:gap-2"
              style={{ background: '#e9e2a1', border: '1.5px solid #cfc98a' }}
            >
              <div>
                <p className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#4c4817' }}>
                  Weekly Duty
                </p>
                <p className="font-hanken font-extrabold text-[36px] leading-none" style={{ color: '#4c4817' }}>
                  48<span className="text-[22px]">h</span>
                </p>
              </div>
              <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8 sm:self-end" strokeWidth="1.5">
                <circle cx="16" cy="16" r="13" stroke="#4c4817" strokeDasharray="4 3" opacity="0.5" />
                <path d="M16 9v7l4 3" stroke="#4c4817" strokeLinecap="round" opacity="0.7" />
              </svg>
            </div>
          </div>

          {/* ── Menu items ──────────────────────────────────────── */}
          <div
            className="bg-white rounded-lg overflow-hidden"
            style={{ border: '1.5px solid #c3c8c1' }}
          >
            {MENU_ITEMS.map(({ label, Icon }, idx) => (
              <button
                key={label}
                type="button"
                className="w-full flex items-center gap-4 px-4 sm:px-5 py-4 text-left hover:bg-tr-surface transition-colors"
                style={{ borderBottom: idx < MENU_ITEMS.length - 1 ? '1px solid #e9e8e3' : 'none' }}
              >
                <Icon className="w-5 h-5 text-tr-on-surface shrink-0" />
                <span className="flex-1 font-hanken font-medium text-tr-on-surface text-[15px]">
                  {label}
                </span>
                <ChevronRightIcon className="w-4 h-4 text-tr-muted shrink-0" />
              </button>
            ))}
          </div>

          {/* ── Logout ──────────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => navigate('/tanod/login')}
            className="w-full rounded flex items-center justify-center gap-3 hover:opacity-90 active:opacity-80 transition-opacity"
            style={{ minHeight: '56px', background: '#b91c1c' }}
          >
            <ArrowRightEndOnRectangleIcon className="w-5 h-5 text-white shrink-0" />
            <span className="font-hanken font-extrabold uppercase tracking-wide text-[17px] text-white">
              Logout
            </span>
          </button>

        </div>
      </div>

      <TanodBottomNav active="profile" />
    </div>
  )
}
