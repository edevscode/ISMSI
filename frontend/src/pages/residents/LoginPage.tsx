import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  FingerPrintIcon,
  ShieldCheckIcon,
  BellAlertIcon,
  DocumentTextIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'
import { login } from '../../api/auth'

const FEATURES = [
  { Icon: BellAlertIcon,    text: 'Get real-time emergency alerts for your barangay' },
  { Icon: ShieldCheckIcon,  text: 'Report incidents and track response status live' },
  { Icon: DocumentTextIcon, text: 'Request official barangay documents online' },
  { Icon: MapPinIcon,       text: 'View community incident map and safety updates' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!identifier.trim() || !password) { setError('Please fill in both fields.'); return }
    setLoading(true)
    setError('')
    try {
      await login(identifier.trim(), password)
      navigate('/residents/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">

      {/* ── Left branded panel — desktop only ─────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between px-14 py-14" style={{ background: '#1a3d28' }}>
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <img src="/ismsi_brand_logo.png" alt="ISMSI" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <p className="font-bold text-white text-[18px] leading-none">ISMSI Portal</p>
              <p className="text-white/50 text-[12px] mt-0.5">Resident Services</p>
            </div>
          </div>

          <h1 className="text-[38px] font-bold text-white leading-tight mb-4">
            Your community,<br />safer together.
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed mb-10 max-w-xs">
            The ISMSI Resident Portal keeps you connected to your barangay's safety network — anytime, anywhere.
          </p>

          <ul className="space-y-4">
            {FEATURES.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-white/80" />
                </div>
                <span className="text-white/75 text-[14px] leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/30 text-[11px] tracking-[0.15em] uppercase font-medium">
          ISMSI Secure Gateway&nbsp;•&nbsp;Barangay Bolacan
        </p>
      </div>

      {/* ── Right form panel ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 lg:py-16 lg:overflow-y-auto">

        {/* Mobile-only logo */}
        <div className="lg:hidden bg-surface rounded-2xl shadow-card p-5 mb-7">
          <img src="/ismsi_brand_logo.png" alt="ISMSI Logo" className="w-20 h-20 object-contain" />
        </div>

        <div className="w-full max-w-[360px]">
          <h1 className="text-[28px] font-bold text-on-surface mb-1 tracking-tight">Welcome back</h1>
          <p className="text-muted text-[15px] mb-8">Sign in to your ISMSI resident account.</p>

          <div className="bg-surface rounded-2xl shadow-card px-7 py-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[12px] font-semibold text-on-surface uppercase tracking-widest mb-2">
                  Resident ID / Email / Phone
                </label>
                <div className="flex items-center border border-outline rounded-lg px-3.5 py-3.5 gap-3 focus-within:border-primary transition-colors">
                  <UserIcon className="w-5 h-5 text-placeholder shrink-0" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your email or phone"
                    className="flex-1 text-sm text-on-surface placeholder-placeholder bg-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[12px] font-semibold text-on-surface uppercase tracking-widest">Password</label>
                </div>
                <div className="flex items-center border border-outline rounded-lg px-3.5 py-3.5 gap-3 focus-within:border-primary transition-colors">
                  <LockClosedIcon className="w-5 h-5 text-placeholder shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 text-sm text-on-surface placeholder-placeholder bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-placeholder hover:text-muted transition-colors shrink-0"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-on-primary font-semibold text-[16px] rounded-lg py-4 flex items-center justify-center gap-2 hover:opacity-90 active:opacity-80 transition-opacity mt-1 disabled:opacity-60"
              >
                {loading ? 'Logging in…' : 'Login'}
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </form>

            <div className="flex items-center my-6 gap-3">
              <div className="flex-1 h-px bg-divider" />
              <span className="text-[11px] text-placeholder font-semibold tracking-[0.12em] uppercase">Or continue with</span>
              <div className="flex-1 h-px bg-divider" />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 border border-on-surface rounded-full px-9 py-3.5 hover:bg-surface-low transition-colors"
              >
                <FingerPrintIcon className="w-6 h-6 text-on-surface" />
                <span className="font-semibold text-on-surface text-[15px]">Biometric Login</span>
              </button>
            </div>

            <p className="text-center text-sm text-muted mt-6">
              Don't have an account?{' '}
              <Link to="/residents/register" className="font-bold text-on-surface hover:text-accent-dark transition-colors">
                Register
              </Link>
            </p>
          </div>

          {/* Mobile-only footer */}
          <p className="lg:hidden text-center mt-8 text-[11px] text-placeholder tracking-[0.15em] uppercase font-medium">
            ISMSI Secure Gateway&nbsp;•&nbsp;Barangay Bolacan
          </p>
        </div>
      </div>
    </div>
  )
}
