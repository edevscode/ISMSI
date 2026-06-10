import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  EyeIcon, EyeSlashIcon, ArrowRightIcon, ArrowLeftIcon,
  CheckCircleIcon, UserIcon, PhoneIcon, HomeIcon,
  EnvelopeIcon, LockClosedIcon, ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { register } from '../../api/auth'

// ── Types ────────────────────────────────────────────────────────────────────

interface Step1 {
  first_name: string
  middle_name: string
  last_name: string
  suffix: string
  phone_number: string
  address: string
}

interface Step2 {
  email: string
  password: string
  confirm_password: string
  agreed: boolean
}

type FieldErrors = Partial<Record<string, string>>

// ── Helpers ──────────────────────────────────────────────────────────────────

function passwordStrength(pwd: string): 0 | 1 | 2 | 3 | 4 {
  if (!pwd) return 0
  let s = 0
  if (pwd.length >= 8) s++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++
  if (/[0-9]/.test(pwd)) s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  return s as 0 | 1 | 2 | 3 | 4
}

const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLOR = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
const STRENGTH_TEXT  = ['', 'text-red-500', 'text-orange-400', 'text-yellow-500', 'text-green-600']

function validatePhone(val: string): string | null {
  const cleaned = val.replace(/\s/g, '')
  if (!cleaned) return 'Phone number is required.'
  if (!/^(09\d{9}|\+639\d{9})$/.test(cleaned))
    return 'Enter a valid PH number (e.g. 09171234567).'
  return null
}

// ── Sub-components ────────────────────────────────────────────────────────────

const inputClass = (err?: string) =>
  `w-full border rounded-lg px-3.5 py-3.5 text-sm text-on-surface placeholder-placeholder outline-none transition-colors bg-surface ${
    err ? 'border-red-400 focus:border-red-400' : 'border-outline focus:border-primary'
  }`

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-on-surface uppercase tracking-widest mb-2">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function StepHeader({ step, title }: { step: 1 | 2; title: string }) {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-muted uppercase tracking-widest">
          Step {step} of 2
        </span>
        <span className="text-[12px] font-semibold text-accent-dark">{title}</span>
      </div>
      <div className="w-full h-1.5 bg-surface-mid rounded-full mb-6">
        <div className={`h-full rounded-full bg-accent transition-all duration-300 ${step === 1 ? 'w-1/2' : 'w-full'}`} />
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const [s1, setS1] = useState<Step1>({
    first_name: '', middle_name: '', last_name: '',
    suffix: '', phone_number: '', address: '',
  })
  const [s2, setS2] = useState<Step2>({
    email: '', password: '', confirm_password: '', agreed: false,
  })

  const set1 = (k: keyof Step1) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setS1((p) => ({ ...p, [k]: e.target.value }))
    setFieldErrors((p) => ({ ...p, [k]: undefined }))
  }
  const set2 = (k: keyof Step2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setS2((p) => ({ ...p, [k]: val }))
    setFieldErrors((p) => ({ ...p, [k]: undefined }))
  }

  // ── Step 1 validation ──────────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errs: FieldErrors = {}
    if (!s1.first_name.trim()) errs.first_name = 'First name is required.'
    if (!s1.last_name.trim())  errs.last_name  = 'Last name is required.'
    const phoneErr = validatePhone(s1.phone_number)
    if (phoneErr) errs.phone_number = phoneErr
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Step 2 validation ──────────────────────────────────────────────────────
  const validateStep2 = (): boolean => {
    const errs: FieldErrors = {}
    if (s2.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s2.email))
      errs.email = 'Enter a valid email address.'
    if (!s2.password) {
      errs.password = 'Password is required.'
    } else if (s2.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.'
    }
    if (s2.password !== s2.confirm_password)
      errs.confirm_password = 'Passwords do not match.'
    if (!s2.agreed)
      errs.agreed = 'You must agree to the terms to continue.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setFieldErrors({})
      setGlobalError('')
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return
    setLoading(true)
    setGlobalError('')
    try {
      await register({
        first_name:   s1.first_name.trim(),
        middle_name:  s1.middle_name.trim() || undefined,
        last_name:    s1.last_name.trim(),
        suffix:       s1.suffix.trim() || undefined,
        phone_number: s1.phone_number.replace(/\s/g, ''),
        address:      s1.address.trim() || undefined,
        email:        s2.email.trim() || undefined,
        password:     s2.password,
      })
      setSuccess(true)
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string | string[]> } })?.response?.data
      if (data) {
        // Map backend field errors to our field names
        const mapped: FieldErrors = {}
        for (const [key, val] of Object.entries(data)) {
          mapped[key] = Array.isArray(val) ? val[0] : String(val)
        }
        // If phone_number or email error, send back to correct step
        if (mapped.phone_number || mapped.first_name || mapped.last_name) {
          setStep(1)
        }
        setFieldErrors(mapped)
        setGlobalError(mapped.non_field_errors ?? mapped.detail ?? '')
      } else {
        setGlobalError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const strength = passwordStrength(s2.password)

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
        <div className="bg-surface rounded-2xl shadow-card w-full max-w-[360px] sm:max-w-md px-7 py-10 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircleIcon className="w-9 h-9 text-primary" />
          </div>
          <h2 className="text-[22px] font-bold text-on-surface">Welcome to ISMSI!</h2>
          <p className="text-sm text-muted leading-relaxed">
            Your resident account has been created. You can now report incidents, track your reports,
            and request barangay documents.
          </p>
          <button
            type="button"
            onClick={() => navigate('/residents/dashboard')}
            className="mt-2 w-full bg-accent text-on-primary font-semibold text-[16px] rounded-lg py-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  // ── Step 1 — Personal Info ─────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center px-5 py-10">
        <div className="bg-surface rounded-2xl shadow-card p-5 mb-7">
          <img src="/ismsi_brand_logo.png" alt="ISMSI Logo" className="w-20 h-20 object-contain" />
        </div>

        <div className="bg-surface rounded-2xl shadow-card w-full max-w-[360px] sm:max-w-md px-7 py-8">
          <StepHeader step={1} title="Personal Info" />
          <h2 className="text-[22px] font-bold text-on-surface mb-1">Create Resident Account</h2>
          <p className="text-sm text-muted leading-relaxed mb-6">
            Provide your official details as they appear on your valid ID.
          </p>

          <div className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name *" error={fieldErrors.first_name}>
                <div className="flex items-center border rounded-lg px-3 gap-2 bg-surface focus-within:border-primary transition-colors" style={{ borderColor: fieldErrors.first_name ? '#f87171' : undefined }}>
                  <UserIcon className="w-4 h-4 text-placeholder shrink-0" />
                  <input
                    type="text" value={s1.first_name} onChange={set1('first_name')}
                    placeholder="Juan"
                    className="flex-1 py-3.5 text-sm text-on-surface placeholder-placeholder bg-transparent outline-none"
                  />
                </div>
              </Field>
              <Field label="Last Name *" error={fieldErrors.last_name}>
                <input type="text" value={s1.last_name} onChange={set1('last_name')} placeholder="Dela Cruz" className={inputClass(fieldErrors.last_name)} />
              </Field>
            </div>

            {/* Middle name + suffix */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Field label="Middle Name" error={fieldErrors.middle_name}>
                  <input type="text" value={s1.middle_name} onChange={set1('middle_name')} placeholder="Santos (optional)" className={inputClass()} />
                </Field>
              </div>
              <Field label="Suffix" error={fieldErrors.suffix}>
                <input type="text" value={s1.suffix} onChange={set1('suffix')} placeholder="Jr." className={inputClass()} />
              </Field>
            </div>

            {/* Phone */}
            <Field label="Mobile Number *" error={fieldErrors.phone_number}>
              <div className={`flex items-center border rounded-lg px-3.5 gap-2 bg-surface focus-within:border-primary transition-colors ${fieldErrors.phone_number ? 'border-red-400' : 'border-outline'}`}>
                <PhoneIcon className="w-4 h-4 text-placeholder shrink-0" />
                <input
                  type="tel" value={s1.phone_number} onChange={set1('phone_number')}
                  placeholder="09171234567"
                  className="flex-1 py-3.5 text-sm text-on-surface placeholder-placeholder bg-transparent outline-none"
                />
              </div>
            </Field>

            {/* Address */}
            <Field label="Residential Address" error={fieldErrors.address}>
              <div className="flex items-center border border-outline rounded-lg px-3.5 gap-2 bg-surface focus-within:border-primary transition-colors">
                <HomeIcon className="w-4 h-4 text-placeholder shrink-0" />
                <input
                  type="text" value={s1.address} onChange={set1('address')}
                  placeholder="Purok, Street, House No. (optional)"
                  className="flex-1 py-3.5 text-sm text-on-surface placeholder-placeholder bg-transparent outline-none"
                />
              </div>
            </Field>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full bg-accent text-on-primary font-semibold text-[16px] rounded-lg py-4 flex items-center justify-center gap-2 hover:opacity-90 active:opacity-80 transition-opacity mt-2"
            >
              Next: Set Credentials
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link to="/residents/login" className="font-bold text-on-surface hover:text-accent-dark transition-colors">Login</Link>
          </p>
        </div>

        <p className="mt-10 text-[11px] text-placeholder tracking-[0.15em] uppercase font-medium">
          ISMSI Secure Gateway&nbsp;•&nbsp;Barangay Bolacan
        </p>
      </div>
    )
  }

  // ── Step 2 — Account Credentials ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-5 py-10">
      <div className="bg-surface rounded-2xl shadow-card p-5 mb-7">
        <img src="/ismsi_brand_logo.png" alt="ISMSI Logo" className="w-20 h-20 object-contain" />
      </div>

      <div className="bg-surface rounded-2xl shadow-card w-full max-w-[360px] sm:max-w-md px-7 py-8">
        <StepHeader step={2} title="Account Setup" />
        <h2 className="text-[22px] font-bold text-on-surface mb-1">Set Your Credentials</h2>
        <p className="text-sm text-muted leading-relaxed mb-6">
          Registering as{' '}
          <span className="font-semibold text-on-surface">
            {s1.first_name} {s1.last_name}
          </span>
          &nbsp;· {s1.phone_number}
        </p>

        {globalError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <Field label="Email Address" error={fieldErrors.email}>
            <div className={`flex items-center border rounded-lg px-3.5 gap-2 bg-surface focus-within:border-primary transition-colors ${fieldErrors.email ? 'border-red-400' : 'border-outline'}`}>
              <EnvelopeIcon className="w-4 h-4 text-placeholder shrink-0" />
              <input
                type="email" value={s2.email} onChange={set2('email')}
                placeholder="name@example.com (optional)"
                className="flex-1 py-3.5 text-sm text-on-surface placeholder-placeholder bg-transparent outline-none"
              />
            </div>
          </Field>

          {/* Password */}
          <Field label="Password *" error={fieldErrors.password}>
            <div className={`flex items-center border rounded-lg px-3.5 gap-2 bg-surface focus-within:border-primary transition-colors ${fieldErrors.password ? 'border-red-400' : 'border-outline'}`}>
              <LockClosedIcon className="w-4 h-4 text-placeholder shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={s2.password} onChange={set2('password')}
                placeholder="Min. 8 characters"
                className="flex-1 py-3.5 text-sm text-on-surface placeholder-placeholder bg-transparent outline-none"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password" className="text-placeholder hover:text-muted transition-colors shrink-0">
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            {s2.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((lvl) => (
                    <div key={lvl} className={`flex-1 h-1 rounded-full transition-colors ${strength >= lvl ? STRENGTH_COLOR[strength] : 'bg-surface-mid'}`} />
                  ))}
                </div>
                <p className={`text-xs font-medium ${STRENGTH_TEXT[strength]}`}>
                  {STRENGTH_LABEL[strength]} password
                </p>
              </div>
            )}
          </Field>

          {/* Confirm Password */}
          <Field label="Confirm Password *" error={fieldErrors.confirm_password}>
            <div className={`flex items-center border rounded-lg px-3.5 gap-2 bg-surface focus-within:border-primary transition-colors ${fieldErrors.confirm_password ? 'border-red-400' : 'border-outline'}`}>
              <ShieldCheckIcon className="w-4 h-4 text-placeholder shrink-0" />
              <input
                type="password" value={s2.confirm_password} onChange={set2('confirm_password')}
                placeholder="Re-enter your password"
                className="flex-1 py-3.5 text-sm text-on-surface placeholder-placeholder bg-transparent outline-none"
              />
              {s2.confirm_password && s2.password === s2.confirm_password && (
                <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
              )}
            </div>
          </Field>

          {/* Terms */}
          <div>
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox" id="terms" checked={s2.agreed} onChange={set2('agreed')}
                className="mt-0.5 w-4 h-4 shrink-0 cursor-pointer accent-accent"
              />
              <label htmlFor="terms" className="text-sm text-muted leading-relaxed cursor-pointer">
                I agree to the{' '}
                <Link to="/terms" className="font-semibold text-accent-dark hover:opacity-80">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="font-semibold text-accent-dark hover:opacity-80">Privacy Policy</Link>
                {' '}of Barangay Bolacan.
              </label>
            </div>
            {fieldErrors.agreed && <p className="text-xs text-red-500 mt-1">{fieldErrors.agreed}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => { setStep(1); setFieldErrors({}); setGlobalError('') }}
              className="flex items-center justify-center gap-2 border border-outline rounded-lg px-5 py-4 text-sm font-semibold text-on-surface hover:bg-surface-low transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-accent text-on-primary font-semibold text-[16px] rounded-lg py-4 flex items-center justify-center gap-2 hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-60"
            >
              {loading ? 'Creating Account…' : 'Create Account'}
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link to="/residents/login" className="font-bold text-on-surface hover:text-accent-dark transition-colors">Login</Link>
        </p>
      </div>

      <p className="mt-10 text-[11px] text-placeholder tracking-[0.15em] uppercase font-medium">
        ISMSI Secure Gateway&nbsp;•&nbsp;Barangay Bolacan
      </p>
    </div>
  )
}
