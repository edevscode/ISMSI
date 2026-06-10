import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

interface TanodTopNavProps {
  title: string
  showBack?: boolean
  right?: 'badge' | 'diamond' | 'none'
  badge?: string
  badgeDot?: boolean
  rightSlot?: React.ReactNode
}

function DiamondIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-5 h-5 text-tr-on-surface"
    >
      <path d="M10 2L18 10L10 18L2 10Z" />
    </svg>
  )
}

export default function TanodTopNav({
  title,
  showBack = false,
  right = 'badge',
  badge = 'Available',
  badgeDot = false,
  rightSlot,
}: TanodTopNavProps) {
  const navigate = useNavigate()

  const rightEl =
    rightSlot !== undefined ? (
      rightSlot
    ) : right === 'badge' ? (
      <div
        className="flex items-center gap-2 font-jetbrains text-[11px] font-semibold uppercase tracking-[0.1em] text-tr-on-primary bg-tr-primary-container px-3 py-1.5"
        style={{ borderRadius: '4px' }}
      >
        {badge}
        {badgeDot && <div className="w-2 h-2 rounded-full bg-[#22c55e]" />}
      </div>
    ) : right === 'diamond' ? (
      <DiamondIcon />
    ) : null

  if (showBack) {
    return (
      <header className="bg-tr-bg border-b border-tr-divider px-4 sm:px-6 py-3.5 flex items-center gap-3 sticky top-0 z-20">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-tr-surface transition-colors shrink-0"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="w-5 h-5 text-tr-on-surface" />
        </button>
        <h1 className="flex-1 font-hanken font-extrabold text-tr-on-surface text-[18px] lg:text-[20px] tracking-tight">
          {title}
        </h1>
        {rightEl}
      </header>
    )
  }

  return (
    <header className="bg-tr-bg border-b border-tr-divider px-5 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2 lg:hidden">
        <ShieldCheckIcon className="w-5 h-5 text-tr-on-surface" />
        <span className="font-hanken font-extrabold uppercase tracking-tight text-tr-on-surface text-[17px]">
          {title}
        </span>
      </div>
      {/* Desktop: title only (shield icon is in the sidebar) */}
      <span className="hidden lg:block font-hanken font-extrabold uppercase tracking-tight text-tr-on-surface text-[18px]">
        {title}
      </span>
      {rightEl}
    </header>
  )
}
