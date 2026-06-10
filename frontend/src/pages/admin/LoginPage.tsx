import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  IdentificationIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from '@heroicons/react/24/outline'
import { login } from '../../api/auth'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !password) { setError('Enter your credentials.'); return }
    setLoading(true)
    setError('')
    try {
      const session = await login(identifier.trim(), password)
      if (session.role !== 'ADMIN') {
        setError('Access denied — Admin credentials required.')
        return
      }
      navigate('/admin/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string; error?: string } } })?.response?.data
      setError(msg?.detail ?? msg?.error ?? 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cc-bg flex flex-col">

      {/* Top header */}
      <header className="shrink-0 flex items-center justify-between px-6" style={{ height: '64px', background: '#0e0e0e', borderBottom: '1px solid #434843' }}>
        <div className="flex items-center gap-3">
          <span className="text-cc-on-surface font-semibold text-[17px]" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>
            ISMSI Command
          </span>
          <span className="text-cc-outline-variant text-[17px] font-light select-none">|</span>
          <span className="text-cc-outline font-bold text-[12px] tracking-[0.1em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            PORTAL V4.2
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="w-8 h-8 flex items-center justify-center rounded hover:bg-cc-surface transition-colors">
            <ShieldCheckIcon className="w-5 h-5 text-cc-outline" />
          </button>
          <button type="button" className="w-8 h-8 flex items-center justify-center rounded hover:bg-cc-surface transition-colors">
            <QuestionMarkCircleIcon className="w-5 h-5 text-cc-outline" />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full" style={{ maxWidth: '400px', background: '#1b1c1c', border: '1px solid #434843', borderRadius: '4px', padding: '36px 32px 28px' }}>

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', background: '#ffffff', borderRadius: '4px' }}>
              <img src="/ismsi_brand_logo.png" alt="ISMSI" className="w-14 h-14 object-contain" />
            </div>
          </div>

          <h1 className="text-center text-cc-on-surface font-semibold mb-1" style={{ fontFamily: 'Inter, sans-serif', fontSize: '22px', letterSpacing: '-0.01em' }}>
            Admin Portal Access
          </h1>
          <p className="text-center mb-6" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#c3cc8c', letterSpacing: '0.02em' }}>
            Barangay Bolocan Command Center
          </p>

          <form onSubmit={handleLogin}>
            {error && (
              <div className="mb-4 px-3 py-2.5 rounded" style={{ background: '#450a0a', border: '1px solid #7f1d1d', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            {/* Administrator ID */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c3c8c1' }}>
                  Administrator Email / Phone
                </label>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#8d928c', letterSpacing: '0.02em' }}>[Required]</span>
              </div>
              <div className="flex items-center gap-2.5 px-3" style={{ background: '#0e0e0e', border: '1px solid #434843', borderRadius: '4px', minHeight: '44px' }}>
                <IdentificationIcon className="w-4 h-4 shrink-0" style={{ color: '#8d928c' }} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@ismsi.local"
                  className="flex-1 bg-transparent outline-none"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#e4e2e1' }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c3c8c1' }}>
                  Secure Password
                </label>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#8d928c', letterSpacing: '0.02em' }}>[Encrypted]</span>
              </div>
              <div className="flex items-center gap-2.5 px-3" style={{ background: '#0e0e0e', border: '1px solid #434843', borderRadius: '4px', minHeight: '44px' }}>
                <LockClosedIcon className="w-4 h-4 shrink-0" style={{ color: '#8d928c' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="flex-1 bg-transparent outline-none"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#e4e2e1' }}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="shrink-0 hover:opacity-70 transition-opacity" aria-label="Toggle password">
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" style={{ color: '#8d928c' }} /> : <EyeIcon className="w-4 h-4" style={{ color: '#8d928c' }} />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 font-semibold uppercase tracking-[0.08em] hover:brightness-110 active:brightness-95 transition-all disabled:opacity-60"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', background: '#b4cdb8', color: '#203527', borderRadius: '4px', minHeight: '48px' }}
            >
              <ShieldCheckIcon className="w-4 h-4 shrink-0" />
              {loading ? 'Authenticating…' : 'Secure Login'}
            </button>
          </form>

          <div className="flex items-center justify-between mt-4">
            <button type="button" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity" style={{ color: '#8d928c' }}>
              <QuestionMarkCircleIcon className="w-4 h-4 shrink-0" />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>Forgot Credentials?</span>
            </button>
            <button type="button" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity" style={{ color: '#8d928c' }}>
              <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4 shrink-0" />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>Contact Admin</span>
            </button>
          </div>

          <div className="mt-5 mb-4" style={{ borderTop: '1px solid #434843' }} />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cc-primary shrink-0" />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#8d928c', textTransform: 'uppercase' }}>
                Network: Encrypted
              </span>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#8d928c', textTransform: 'uppercase' }}>
              Zone: PH-R3
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 flex items-center justify-between px-4 sm:px-6" style={{ minHeight: '48px', background: '#0e0e0e', borderTop: '1px solid #434843' }}>
        <div className="flex items-center gap-2 py-2">
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#c3c8c1' }}>
            Authorized Personnel Only
          </span>
          <span className="hidden sm:inline" style={{ color: '#434843', fontSize: '11px' }}>•</span>
          <span className="hidden sm:inline" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.04em', color: '#c3cc8c' }}>
            System Access is Monitored.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          {['System Status', 'Terms of Access', 'Support'].map((link) => (
            <button key={link} type="button" className="hover:text-cc-on-surface transition-colors" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8d928c' }}>
              {link}
            </button>
          ))}
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#434843' }}>
            © 2024 Municipal Emergency Management.
          </span>
        </div>
      </footer>
    </div>
  )
}
