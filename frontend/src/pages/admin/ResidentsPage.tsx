import { useState, useEffect } from 'react'
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  UserPlusIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import AdminSidebar from '../../components/AdminSidebar'
import AdminTopBar from '../../components/AdminTopBar'
import client from '../../api/client'

// ── Types ────────────────────────────────────────────────────────────────────

type VerificationStatus = 'VERIFIED' | 'PENDING' | 'REJECTED' | 'NONE' | 'UNVERIFIED'
type AccountRole = 'TANOD' | 'RESIDENT'

interface ApiResident {
  id: number
  full_name: string
  first_name: string
  last_name: string
  phone_number: string
  email: string | null
  address: string | null
  verification_status: VerificationStatus
  created_at: string | null
  role: AccountRole
}

interface AccountForm {
  role: AccountRole
  first_name: string; middle_name: string; last_name: string; suffix: string
  phone_number: string; email: string; address: string
  password: string; confirm_password: string
}

type FieldErrors = Partial<Record<keyof AccountForm | 'global', string>>

const V_STYLE: Record<VerificationStatus, { bg: string; color: string; border: string; Icon: React.ElementType }> = {
  VERIFIED:   { bg: '#1b3022', color: '#b4cdb8', border: '#364c3c', Icon: CheckCircleIcon        },
  PENDING:    { bg: '#434b18', color: '#c3cc8c', border: '#5a6325', Icon: ClockIcon               },
  REJECTED:   { bg: '#450a0a', color: '#fca5a5', border: '#7f1d1d', Icon: ExclamationTriangleIcon },
  UNVERIFIED: { bg: '#450a0a', color: '#fca5a5', border: '#7f1d1d', Icon: ExclamationTriangleIcon },
  NONE:       { bg: '#252626', color: '#6b7280', border: '#434843', Icon: ClockIcon               },
}

const ROLE_STYLE: Record<AccountRole, { bg: string; color: string; border: string }> = {
  RESIDENT: { bg: '#1a2a3a', color: '#93c5fd', border: '#1e3a5f' },
  TANOD:    { bg: '#2a1a3a', color: '#c4b5fd', border: '#3a1f5f' },
}

function initials(name: string): string {
  const parts = name.trim().split(' ')
  return (parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')
}

function initialsColor(id: number): string {
  const palette = ['#22c55e', '#a3a830', '#3b82f6', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4']
  return palette[id % palette.length]
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Style helpers ─────────────────────────────────────────────────────────────

const MONO: React.CSSProperties  = { fontFamily: "'JetBrains Mono', monospace" }
const INTER: React.CSSProperties = { fontFamily: 'Inter, sans-serif' }
const LABEL: React.CSSProperties = { ...MONO, fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#8d928c' }

const inputStyle = (err?: string): React.CSSProperties => ({
  width: '100%', background: '#0e0e0e',
  border: `1px solid ${err ? '#7f1d1d' : '#434843'}`,
  borderRadius: '4px', padding: '10px 12px',
  color: '#e4e2e1', fontSize: '13px', outline: 'none',
  fontFamily: "'JetBrains Mono', monospace",
  boxSizing: 'border-box',
})

// ── Create Account Modal (Tanod or Resident) ─────────────────────────────────

function CreateAccountModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (name: string, role: AccountRole) => void }) {
  const [form, setForm] = useState<AccountForm>({
    role: 'TANOD',
    first_name: '', middle_name: '', last_name: '', suffix: '',
    phone_number: '', email: '', address: '',
    password: '', confirm_password: '',
  })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState<FieldErrors>({})

  const set = (k: keyof AccountForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p: AccountForm) => ({ ...p, [k]: e.target.value }))
    setErrors((p: FieldErrors) => ({ ...p, [k]: undefined, global: undefined }))
  }

  const setRole = (role: AccountRole) => {
    setForm((p) => ({ ...p, role }))
    setErrors({})
  }

  const validate = (): boolean => {
    const errs: FieldErrors = {}
    if (!form.first_name.trim())   errs.first_name   = 'Required'
    if (!form.last_name.trim())    errs.last_name    = 'Required'
    if (!form.phone_number.trim()) errs.phone_number = 'Required'
    if (!form.password)            errs.password     = 'Required'
    else if (form.password.length < 8) errs.password = 'Min. 8 characters'
    if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await client.post('/auth/accounts/', {
        role:         form.role,
        first_name:   form.first_name.trim(),
        middle_name:  form.middle_name.trim() || undefined,
        last_name:    form.last_name.trim(),
        suffix:       form.suffix.trim() || undefined,
        phone_number: form.phone_number.trim(),
        email:        form.email.trim() || undefined,
        address:      form.address.trim() || undefined,
        password:     form.password,
      })
      onSuccess(`${form.first_name.trim()} ${form.last_name.trim()}`, form.role)
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string | string[]> } })?.response?.data
      if (data) {
        const mapped: FieldErrors = {}
        for (const [k, v] of Object.entries(data)) {
          ;(mapped as Record<string, string>)[k] = Array.isArray(v) ? v[0] : String(v)
        }
        setErrors(mapped)
      } else {
        setErrors({ global: 'Failed to create account. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const isTanod = form.role === 'TANOD'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />

      <div style={{ position: 'relative', width: '520px', maxHeight: '90vh', overflowY: 'auto', background: '#1b1c1c', border: '1px solid #434843', borderRadius: '6px', padding: '28px 28px 24px', ...INTER }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#1b3022', border: '1px solid #364c3c', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheckIcon style={{ width: '16px', height: '16px', color: '#b4cdb8' }} />
            </div>
            <div>
              <div style={{ color: '#e4e2e1', fontSize: '16px', fontWeight: 700 }}>Create Account</div>
              <div style={{ ...MONO, fontSize: '10px', color: '#8d928c', letterSpacing: '0.06em', marginTop: '2px' }}>ADMIN ONLY</div>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ width: '28px', height: '28px', background: '#252626', border: '1px solid #434843', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <XMarkIcon style={{ width: '14px', height: '14px', color: '#8d928c' }} />
          </button>
        </div>

        {/* Role selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {(['TANOD', 'RESIDENT'] as AccountRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              style={{
                flex: 1, padding: '9px', borderRadius: '4px', cursor: 'pointer',
                border: `1px solid ${form.role === r ? '#364c3c' : '#434843'}`,
                background: form.role === r ? '#1b3022' : '#252626',
                color: form.role === r ? '#b4cdb8' : '#8d928c',
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', ...MONO,
              }}
            >
              {r === 'TANOD' ? 'Tanod (Field Responder)' : 'Resident'}
            </button>
          ))}
        </div>

        {errors.global && (
          <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '4px', padding: '10px 14px', color: '#fca5a5', fontSize: '13px', marginBottom: '16px', ...MONO }}>
            {errors.global}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <div style={{ ...LABEL, marginBottom: '6px' }}>First Name *</div>
              <input value={form.first_name} onChange={set('first_name')} placeholder="Juan" style={inputStyle(errors.first_name)} />
              {errors.first_name && <div style={{ color: '#fca5a5', fontSize: '11px', marginTop: '4px', ...MONO }}>{errors.first_name}</div>}
            </div>
            <div>
              <div style={{ ...LABEL, marginBottom: '6px' }}>Last Name *</div>
              <input value={form.last_name} onChange={set('last_name')} placeholder="Dela Cruz" style={inputStyle(errors.last_name)} />
              {errors.last_name && <div style={{ color: '#fca5a5', fontSize: '11px', marginTop: '4px', ...MONO }}>{errors.last_name}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <div style={{ ...LABEL, marginBottom: '6px' }}>Middle Name</div>
              <input value={form.middle_name} onChange={set('middle_name')} placeholder="Santos (optional)" style={inputStyle()} />
            </div>
            <div>
              <div style={{ ...LABEL, marginBottom: '6px' }}>Suffix</div>
              <input value={form.suffix} onChange={set('suffix')} placeholder="Jr." style={inputStyle()} />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ ...LABEL, marginBottom: '6px' }}>Phone Number *</div>
            <input value={form.phone_number} onChange={set('phone_number')} placeholder="09171234567" style={inputStyle(errors.phone_number)} />
            {errors.phone_number && <div style={{ color: '#fca5a5', fontSize: '11px', marginTop: '4px', ...MONO }}>{errors.phone_number}</div>}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ ...LABEL, marginBottom: '6px' }}>Email Address</div>
            <input type="email" value={form.email} onChange={set('email')} placeholder={isTanod ? 'tanod@ismsi.local (optional)' : 'resident@example.com (optional)'} style={inputStyle(errors.email)} />
            {errors.email && <div style={{ color: '#fca5a5', fontSize: '11px', marginTop: '4px', ...MONO }}>{errors.email}</div>}
          </div>

          {/* Address — only for residents */}
          {!isTanod && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ ...LABEL, marginBottom: '6px' }}>Residential Address</div>
              <input value={form.address} onChange={set('address')} placeholder="Purok, Street, House No. (optional)" style={inputStyle()} />
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <div style={{ ...LABEL, marginBottom: '6px' }}>Password * (min. 8 chars)</div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password} onChange={set('password')} placeholder="••••••••"
                style={{ ...inputStyle(errors.password), paddingRight: '40px' }}
              />
              <button type="button" onClick={() => setShowPw((v) => !v)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8d928c' }}>
                {showPw ? <EyeSlashIcon style={{ width: '16px', height: '16px' }} /> : <EyeIcon style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
            {errors.password && <div style={{ color: '#fca5a5', fontSize: '11px', marginTop: '4px', ...MONO }}>{errors.password}</div>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ ...LABEL, marginBottom: '6px' }}>Confirm Password *</div>
            <input type="password" value={form.confirm_password} onChange={set('confirm_password')} placeholder="••••••••" style={inputStyle(errors.confirm_password)} />
            {errors.confirm_password && <div style={{ color: '#fca5a5', fontSize: '11px', marginTop: '4px', ...MONO }}>{errors.confirm_password}</div>}
          </div>

          <div style={{ background: '#252626', border: '1px solid #434843', borderRadius: '4px', padding: '10px 14px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <ShieldCheckIcon style={{ width: '16px', height: '16px', color: '#8d928c', flexShrink: 0, marginTop: '1px' }} />
            <span style={{ color: '#8d928c', fontSize: '12px', ...INTER, lineHeight: 1.5 }}>
              {isTanod
                ? 'The tanod can log in to the Field Responder portal using phone or email + password.'
                : 'The resident can log in to the Resident portal using phone or email + password.'}
              {' '}Share credentials securely.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: '#252626', border: '1px solid #434843', borderRadius: '4px', padding: '11px', color: '#c3c8c1', fontSize: '13px', fontWeight: 600, cursor: 'pointer', ...INTER }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, background: loading ? '#2a4034' : '#1b3022', border: '1px solid #364c3c', borderRadius: '4px', padding: '11px', color: '#b4cdb8', fontSize: '13px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, ...INTER }}>
              {loading ? 'Creating…' : `Create ${isTanod ? 'Tanod' : 'Resident'} Account`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Success Toast ──────────────────────────────────────────────────────────────

function SuccessToast({ name, role, onClose }: { name: string; role: AccountRole; onClose: () => void }) {
  const isTanod = role === 'TANOD'
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 60, background: '#1b3022', border: '1px solid #364c3c', borderRadius: '6px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', maxWidth: '360px', ...INTER }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#253c2c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <CheckCircleIcon style={{ width: '18px', height: '18px', color: '#b4cdb8' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#b4cdb8', fontSize: '13px', fontWeight: 700 }}>
          {isTanod ? 'Tanod Account Created' : 'Resident Account Created'}
        </div>
        <div style={{ color: '#8d928c', fontSize: '12px', marginTop: '2px' }}>
          {name} can now log in to the {isTanod ? 'Field Responder' : 'Resident'} portal.
        </div>
      </div>
      <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8d928c', padding: '2px' }}>
        <XMarkIcon style={{ width: '16px', height: '16px' }} />
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminResidentsPage() {
  const [allUsers, setAllUsers]     = useState<ApiResident[]>([])
  const [loading, setLoading]       = useState(true)
  const [roleFilter, setRoleFilter] = useState<AccountRole | ''>('')
  const [showModal, setShowModal]   = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [toast, setToast]           = useState<{ name: string; role: AccountRole } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const residents = roleFilter ? allUsers.filter((u) => u.role === roleFilter) : allUsers

  const fetchResidents = () => {
    client.get<ApiResident[]>('/auth/accounts/')
      .then((r) => setAllUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchResidents() }, [])

  const handleSuccess = (name: string, role: AccountRole) => {
    setShowModal(false)
    setToast({ name, role })
    setTimeout(() => setToast(null), 5000)
    fetchResidents()
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#131313', overflow: 'hidden', ...INTER }}>

      <AdminSidebar active="residents" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        <AdminTopBar
          searchPlaceholder="Search by name, ID, or phone number..."
          onMenuClick={() => setSidebarOpen(true)}
          midSlot={
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid #434843', paddingLeft: '14px' }}>
              <span style={{ ...MONO, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#8d928c', textTransform: 'uppercase' }}>
                User Directory
              </span>
              {!loading && (
                <span style={{ ...MONO, fontSize: '10px', color: '#434843', letterSpacing: '0.04em' }}>
                  {residents.length} record{residents.length !== 1 ? 's' : ''}
                </span>
              )}
              <span style={{ ...MONO, fontSize: '10px', color: '#434843', letterSpacing: '0.04em' }}>
                {!loading && `(${allUsers.filter(u => u.role === 'RESIDENT').length} residents · ${allUsers.filter(u => u.role === 'TANOD').length} tanods)`}
              </span>
            </div>
          }
        />

        {/* Filter + actions bar */}
        <div style={{ background: '#1f2020', borderBottom: '1px solid #434843', padding: '11px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
            <span style={{ ...LABEL }}>Filter by Role:</span>
            <button
              type="button"
              onClick={() => setShowFilter((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1b3022', border: '1px solid #364c3c', borderRadius: '4px', padding: '6px 12px', color: '#b4cdb8', fontSize: '13px', fontWeight: 600, cursor: 'pointer', ...INTER }}
            >
              {roleFilter === '' ? 'All Users' : roleFilter === 'RESIDENT' ? 'Residents' : 'Tanods'}
              <ChevronDownIcon style={{ width: '13px', height: '13px' }} />
            </button>
            {showFilter && (
              <>
                <div onClick={() => setShowFilter(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                <div style={{ position: 'absolute', top: '100%', left: '84px', marginTop: '4px', background: '#1b1c1c', border: '1px solid #434843', borderRadius: '6px', overflow: 'hidden', zIndex: 20, minWidth: '140px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                  {([['', 'All Users'], ['RESIDENT', 'Residents'], ['TANOD', 'Tanods']] as [AccountRole | '', string][]).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { setRoleFilter(val); setShowFilter(false) }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', background: roleFilter === val ? '#1b3022' : 'transparent', color: roleFilter === val ? '#b4cdb8' : '#c3c8c1', fontSize: '13px', border: 'none', cursor: 'pointer', ...INTER }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#252626', border: '1px solid #434843', borderRadius: '4px', padding: '7px 14px', color: '#c3c8c1', fontSize: '13px', cursor: 'pointer', ...INTER }}>
              <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} />
              Export List
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1b3022', border: '1px solid #364c3c', borderRadius: '4px', padding: '7px 14px', color: '#b4cdb8', fontSize: '13px', fontWeight: 600, cursor: 'pointer', ...INTER }}
            >
              <UserPlusIcon style={{ width: '14px', height: '14px' }} />
              Create Account
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.9fr 1.2fr 1.2fr 1fr 0.4fr', background: '#1b1c1c', borderBottom: '1px solid #434843', padding: '0 20px', position: 'sticky', top: 0, zIndex: 1 }}>
            {['Name', 'Role', 'Verification', 'Contact Number', 'Registered', ''].map((col) => (
              <div key={col} style={{ ...LABEL, padding: '11px 0' }}>{col}</div>
            ))}
          </div>

          {/* Loading / empty states */}
          {loading && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#8d928c', ...MONO, fontSize: '12px' }}>
              Loading residents…
            </div>
          )}
          {!loading && residents.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#8d928c', ...MONO, fontSize: '12px' }}>
              No accounts found. Accounts appear here once users register or are created by an admin.
            </div>
          )}

          {residents.map((res) => {
            const verStatus = (res.verification_status in V_STYLE ? res.verification_status : 'NONE') as VerificationStatus
            const vs  = V_STYLE[verStatus]
            const rs  = ROLE_STYLE[res.role] ?? ROLE_STYLE.RESIDENT
            const ini = initials(res.full_name).toUpperCase()
            const clr = initialsColor(res.id)
            return (
              <div
                key={res.id}
                style={{ display: 'grid', gridTemplateColumns: '2fr 0.9fr 1.2fr 1.2fr 1fr 0.4fr', padding: '0 20px', borderBottom: '1px solid #252626', alignItems: 'center', minHeight: '76px', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1e1f1e')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: clr, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>{ini}</span>
                  </div>
                  <div>
                    <div style={{ color: '#e4e2e1', fontSize: '14px', fontWeight: 600 }}>{res.full_name}</div>
                    <div style={{ ...MONO, color: '#8d928c', fontSize: '11px', letterSpacing: '0.04em', marginTop: '2px' }}>
                      {res.email ?? res.phone_number}
                    </div>
                  </div>
                </div>

                {/* Role badge */}
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`, fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', ...MONO, letterSpacing: '0.06em' }}>
                    {res.role}
                  </span>
                </div>

                {/* Verification badge */}
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: vs.bg, color: vs.color, border: `1px solid ${vs.border}`, fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '999px' }}>
                    <vs.Icon style={{ width: '12px', height: '12px' }} />
                    {verStatus === 'NONE' ? 'Unverified' : verStatus.charAt(0) + verStatus.slice(1).toLowerCase()}
                  </span>
                </div>

                {/* Phone */}
                <div style={{ ...MONO, color: '#c3c8c1', fontSize: '12px', letterSpacing: '0.02em' }}>{res.phone_number}</div>

                {/* Registered date */}
                <div style={{ color: '#8d928c', fontSize: '13px' }}>{formatDate(res.created_at)}</div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <ChevronRightIcon style={{ width: '18px', height: '18px', color: '#8d928c' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && <CreateAccountModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />}

      {/* Success toast */}
      {toast && <SuccessToast name={toast.name} role={toast.role} onClose={() => setToast(null)} />}
    </div>
  )
}
