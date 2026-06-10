import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PencilSquareIcon,
  LockClosedIcon,
  UserGroupIcon,
  LanguageIcon,
  ChevronRightIcon,
  ArrowRightStartOnRectangleIcon,
  CameraIcon,
  PlusIcon,
  IdentificationIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'
import { ShieldCheckIcon, UserCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid'
import TopNav from '../../components/TopNav'
import BottomNav from '../../components/BottomNav'
import { getSession, logout } from '../../api/auth'
import client from '../../api/client'

interface UserProfile {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  full_name: string
  phone_number: string
  address: string | null
  email: string | null
  role_name: string
  is_active: boolean
}

interface VerificationStatus {
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NONE'
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const session = getSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [verif, setVerif]   = useState<VerificationStatus>({ status: 'NONE' })

  useEffect(() => {
    if (!session) { navigate('/residents/login'); return }

    client.get<UserProfile>('/auth/me/').then((res) => setProfile(res.data)).catch(() => {})
    // Try to fetch verification status (endpoint may not exist yet — swallow 404)
    client.get<{ status: VerificationStatus['status'] }>('/verifications/me/')
      .then((res) => setVerif({ status: res.data.status }))
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    logout()
    navigate('/residents/login')
  }

  const displayName  = profile?.full_name  ?? session?.full_name  ?? 'Resident'
  const displayPhone = profile?.phone_number ?? session?.phone_number ?? '–'
  const displayEmail = profile?.email ?? null
  const isVerified   = verif.status === 'VERIFIED'
  const isPending    = verif.status === 'PENDING'

  return (
    <div className="min-h-screen bg-background flex flex-col lg:pl-64">
      <TopNav title="ISMSI Portal" />

      <div className="flex-1 px-5 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">

        {/* Profile card */}
        <div className="bg-surface rounded-2xl shadow-card px-6 py-7 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-low flex items-center justify-center" style={{ boxShadow: '0 0 0 4px #d0e9d4' }}>
              <UserCircleIcon className="w-24 h-24 text-outline" />
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-surface">
              {isVerified
                ? <ShieldCheckIcon className="w-4 h-4 text-on-primary" />
                : <ExclamationCircleIcon className="w-4 h-4 text-on-primary/70" />}
            </div>
          </div>
          <h2 className="text-[20px] font-bold text-on-surface mb-1">{displayName}</h2>

          {/* Verification badge */}
          {isVerified && (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary mb-3">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-on-primary" />
              <span className="text-on-primary text-[12px] font-semibold">Verified Resident</span>
            </div>
          )}
          {isPending && (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-3">
              <span className="text-accent-dark text-[12px] font-semibold">Verification Pending</span>
            </div>
          )}
          {verif.status === 'NONE' && (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-low mb-3">
              <span className="text-muted text-[12px] font-semibold">Not Verified</span>
            </div>
          )}

          {/* Contact info */}
          <div className="w-full space-y-2 mt-2">
            <div className="flex items-center gap-3 px-4 py-3 bg-surface-low rounded-xl">
              <PhoneIcon className="w-4 h-4 text-muted shrink-0" />
              <span className="text-sm text-on-surface font-medium">{displayPhone}</span>
            </div>
            {displayEmail && (
              <div className="flex items-center gap-3 px-4 py-3 bg-surface-low rounded-xl">
                <EnvelopeIcon className="w-4 h-4 text-muted shrink-0" />
                <span className="text-sm text-on-surface font-medium">{displayEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Verification status card */}
        {isVerified ? (
          <div className="bg-surface rounded-2xl shadow-card border-l-4 border-primary px-5 py-5">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">ID Verification</p>
                <h3 className="text-[20px] font-bold text-on-surface mb-2">Verified</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Your identity has been confirmed. You have full access to community emergency reporting.
                </p>
              </div>
              <IdentificationIcon className="w-9 h-9 text-muted shrink-0" />
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl shadow-card border-l-4 border-accent px-5 py-5">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">ID Verification</p>
                <h3 className="text-[20px] font-bold text-on-surface mb-2">
                  {isPending ? 'Under Review' : 'Not Verified'}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {isPending
                    ? 'Your documents are being reviewed by the barangay. Please wait for approval.'
                    : 'Verify your identity to access all community features and services.'}
                </p>
              </div>
              <IdentificationIcon className="w-9 h-9 text-muted shrink-0" />
            </div>
          </div>
        )}

        {/* Account Settings */}
        <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted px-5 pt-5 pb-3">Account Settings</p>
          <div className="divide-y divide-divider">
            {[
              { Icon: PencilSquareIcon, label: 'Edit Profile' },
              { Icon: LockClosedIcon,   label: 'Change Password' },
              { Icon: UserGroupIcon,    label: 'Emergency Contacts' },
              { Icon: LanguageIcon,     label: 'Language', sublabel: 'English (US)' },
            ].map(({ Icon, label, sublabel }) => (
              <button key={label} type="button" className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface-low transition-colors text-left">
                <Icon className="w-5 h-5 text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface">{label}</p>
                  {sublabel && <p className="text-xs text-muted mt-0.5">{sublabel}</p>}
                </div>
                <ChevronRightIcon className="w-4 h-4 text-placeholder shrink-0" />
              </button>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 transition-colors"
            >
              <ArrowRightStartOnRectangleIcon className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-sm font-semibold text-red-500">Logout</span>
            </button>
          </div>
        </div>

        {/* Re-verify upload card */}
        {!isVerified && (
          <div className="bg-surface-low border-2 border-dashed border-divider rounded-2xl px-6 py-8 flex flex-col items-center text-center">
            <div className="relative w-16 h-16 rounded-full bg-surface shadow-card flex items-center justify-center mb-5">
              <CameraIcon className="w-7 h-7 text-muted" />
              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-surface-mid flex items-center justify-center">
                <PlusIcon className="w-2.5 h-2.5 text-muted" />
              </div>
            </div>
            <h3 className="text-[17px] font-bold text-on-surface mb-2">
              {isPending ? 'Verification In Progress' : 'Get Verified'}
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-6 max-w-[230px]">
              {isPending
                ? 'Your documents are under review. This typically takes 1-2 business days.'
                : 'Upload a clear photo of your Government ID to verify your residency.'}
            </p>
            {!isPending && (
              <button type="button" className="bg-accent text-on-primary font-semibold text-[15px] rounded-lg px-10 py-3.5 hover:opacity-90 active:opacity-80 transition-opacity">
                Upload ID
              </button>
            )}
          </div>
        )}
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  )
}
