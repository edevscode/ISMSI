import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IdentificationIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  FingerPrintIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { login } from '../../api/auth'

function FieldLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-tr-on-surface" />
      <span className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.09em] text-tr-on-surface">
        {children}
      </span>
    </div>
  )
}

const FEATURES = [
  'Real-time incident tracking',
  'GPS-enabled field response',
  'Secure encrypted communications',
  'Direct police escalation',
]

export default function TanodLoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!identifier.trim() || !password) { setError('Enter your ID/phone and password.'); return }
    setLoading(true)
    setError('')
    try {
      const session = await login(identifier.trim(), password)
      if (session.role !== 'TANOD') {
        setError('This portal is for Tanod personnel only.')
        return
      }
      navigate('/tanod/home')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string; error?: string } } })?.response?.data
      setError(msg?.detail ?? msg?.error ?? 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-tr-surface border border-tr-divider rounded px-4 py-3.5 ' +
    'font-jetbrains text-sm text-tr-on-surface placeholder-tr-placeholder ' +
    'outline-none focus:border-tr-primary-container transition-colors'

  return (
    <div className="min-h-screen bg-tr-bg flex flex-col lg:flex-row">

      {/* ── Left branding panel — desktop only ─────────────────── */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 lg:min-h-screen lg:flex-col lg:items-center lg:justify-center lg:px-16 lg:py-12"
        style={{ backgroundColor: '#1b3022' }}
      >
        {/* Logo */}
        <div className="rounded-xl p-6 mb-8" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <img src="/ismsi_brand_logo.png" alt="ISMSI Logo" className="w-24 h-24 object-contain" />
        </div>

        <h1
          className="font-hanken font-extrabold text-white uppercase tracking-tight text-center mb-2"
          style={{ fontSize: '30px', letterSpacing: '-0.01em' }}
        >
          ISMSI Field Responder
        </h1>
        <p className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.15em] mb-12 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Secure Operational Gateway
        </p>

        {/* Feature bullets */}
        <div className="space-y-4 w-full max-w-xs mb-12">
          {FEATURES.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              </div>
              <span className="font-hanken text-[14px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* Warning badge */}
        <div className="w-full max-w-xs rounded flex items-center gap-2.5 px-4 py-3 mb-8" style={{ background: '#b91c1c' }}>
          <ExclamationTriangleIcon className="w-4 h-4 text-white shrink-0" />
          <span className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
            Authorized Personnel Only
          </span>
        </div>

        {/* Footer */}
        <div className="mt-auto text-center">
          <p className="font-hanken text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Barangay Bolacan&nbsp;·&nbsp;Response Unit
          </p>
          <p className="font-jetbrains text-[10px] tracking-[0.08em] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
            SYSTEM v4.0.2-FIELD
          </p>
        </div>
      </div>

      {/* ── Right / Mobile form panel ───────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-start px-5 py-10 lg:justify-center lg:px-12 xl:px-20 lg:py-12">

        {/* Mobile-only: logo + heading */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="bg-white border border-tr-divider rounded-lg p-5 mb-7 shadow-sm">
            <img src="/ismsi_brand_logo.png" alt="ISMSI Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1
            className="font-hanken font-extrabold text-tr-on-surface uppercase tracking-tight mb-1 text-center"
            style={{ fontSize: '26px', letterSpacing: '-0.01em' }}
          >
            ISMSI Field Responder
          </h1>
          <p className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.15em] text-tr-muted text-center">
            Secure Operational Gateway
          </p>
        </div>

        {/* Desktop heading above the card */}
        <div className="hidden lg:block w-full max-w-sm mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <ShieldCheckIcon className="w-6 h-6 text-tr-on-surface" />
            <span className="font-hanken font-extrabold text-tr-on-surface text-[22px] uppercase tracking-tight">
              Sign In
            </span>
          </div>
          <p className="font-jetbrains text-[12px] text-tr-muted uppercase tracking-[0.1em]">
            Enter your credentials to access the portal
          </p>
        </div>

        {/* Form card */}
        <div
          className="w-full max-w-sm bg-white rounded-lg px-6 py-6"
          style={{ border: '3px solid #1b3022' }}
        >
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-sm text-red-700 font-jetbrains">
                {error}
              </div>
            )}

            {/* Badge ID / Phone */}
            <div>
              <FieldLabel icon={IdentificationIcon}>Badge ID / Phone Number</FieldLabel>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Phone or email"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div>
              <FieldLabel icon={LockClosedIcon}>Password</FieldLabel>
              <div className="flex items-center bg-tr-surface border border-tr-divider rounded focus-within:border-tr-primary-container transition-colors">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 px-4 py-3.5 font-jetbrains text-sm text-tr-on-surface placeholder-tr-placeholder bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="px-3.5 text-tr-placeholder hover:text-tr-muted transition-colors shrink-0"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-tr-primary-container text-tr-on-primary font-hanken font-bold uppercase tracking-wide rounded flex items-center justify-center gap-3 hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-60"
              style={{ minHeight: '56px', fontSize: '15px', letterSpacing: '0.04em' }}
            >
              {loading ? 'Verifying…' : 'Login to Portal'}
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-tr-divider" />
            <span className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.12em] text-tr-muted whitespace-nowrap">
              Or Use Biometrics
            </span>
            <div className="flex-1 h-px bg-tr-divider" />
          </div>

          <div className="flex flex-col items-center gap-2.5">
            <button
              type="button"
              className="w-20 h-20 rounded-xl bg-tr-surface border border-tr-divider flex items-center justify-center hover:bg-tr-surface-mid transition-colors"
            >
              <FingerPrintIcon className="w-10 h-10 text-tr-on-surface" />
            </button>
            <span className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.12em] text-tr-muted">
              Tap to Scan
            </span>
          </div>

          <div className="mt-6 pt-5 border-t border-tr-divider flex items-center justify-center gap-2">
            <QuestionMarkCircleIcon className="w-4 h-4 text-tr-muted shrink-0" />
            <p className="font-jetbrains text-[10px] uppercase tracking-[0.09em] text-tr-muted">
              Unable to log in?{' '}
              <span className="font-semibold text-tr-on-surface cursor-pointer hover:underline">Contact Admin</span>
            </p>
          </div>
        </div>

        {/* Mobile-only: authorized badge + footer */}
        <div className="lg:hidden w-full max-w-sm mt-5">
          <div className="bg-tr-critical rounded flex items-center justify-center gap-2.5 px-5 py-3">
            <ExclamationTriangleIcon className="w-4 h-4 text-white shrink-0" />
            <span className="font-jetbrains text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
              Authorized Personnel Only
            </span>
          </div>
          <div className="mt-6 flex flex-col items-center gap-1 text-center">
            <p className="font-hanken text-[12px] font-semibold uppercase tracking-[0.08em] text-tr-muted">
              Barangay Bolacan&nbsp;•&nbsp;Response Unit
            </p>
            <p className="font-jetbrains text-[10px] tracking-[0.08em] text-tr-placeholder">
              SYSTEM v4.0.2-FIELD
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
