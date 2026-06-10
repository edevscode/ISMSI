import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPinIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { getSession } from '../../api/auth'

// 'checking' — waiting for permissions API (buttons hidden, no user action possible)
// 'prompt'   — permission unknown / grantable, show Allow + Skip
// 'requesting'— getCurrentPosition() in flight, browser dialog open
// 'granted'  — success
// 'denied'   — blocked (never calls getCurrentPosition in this state)
type Stage = 'checking' | 'prompt' | 'requesting' | 'granted' | 'denied'

const WHY = [
  'Accurately pin your incident report on the barangay map',
  'Help tanods navigate to your exact location faster',
  'Receive safety alerts relevant to your immediate area',
]

export default function LocationPermissionPage() {
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('checking')

  const destination = getSession()?.role === 'RESIDENT'
    ? '/residents/dashboard'
    : '/residents/login'

  const proceed = useCallback(() => {
    navigate(destination, { replace: true })
  }, [destination, navigate])

  // Resolve initial state BEFORE showing any buttons — no race possible
  useEffect(() => {
    if (!navigator.permissions) { setStage('prompt'); return }
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((res) => setStage(res.state === 'denied' ? 'denied' : 'prompt'))
      .catch(() => setStage('prompt'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAllow = () => {
    if (!navigator.geolocation) { setStage('denied'); return }
    setStage('requesting')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        sessionStorage.setItem('ismsi_last_gps', JSON.stringify({
          lat: coords.latitude,
          lon: coords.longitude,
          ts:  Date.now(),
        }))
        setStage('granted')
        setTimeout(proceed, 800)
      },
      () => setStage('denied'),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const isChecking   = stage === 'checking'
  const isGranted    = stage === 'granted'
  const isDenied     = stage === 'denied'
  const isRequesting = stage === 'requesting'
  const isPulsing    = stage === 'prompt' || isRequesting || isChecking

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">

      {/* ── Left / Top: branded green panel ─────────────────── */}
      <div
        className="flex flex-col items-center px-8 pt-12 pb-10 lg:w-5/12 xl:w-1/2 lg:justify-between lg:pt-14 lg:pb-14"
        style={{ background: '#1a3d28' }}
      >
        <div className="flex items-center gap-3 self-start">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
            <img src="/ismsi_brand_logo.png" alt="ISMSI" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <p className="font-bold text-white text-[17px] leading-none">ISMSI Portal</p>
            <p className="text-white/50 text-[12px] mt-0.5">Resident Services</p>
          </div>
        </div>

        <div className="flex flex-col items-center my-10 lg:my-0 lg:flex-1 lg:justify-center">
          <div className="relative flex items-center justify-center mb-5" style={{ width: 128, height: 128 }}>
            {isPulsing && (
              <>
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: 'rgba(255,255,255,0.07)', animationDuration: '2s' }}
                />
                <div
                  className="absolute rounded-full animate-ping"
                  style={{ inset: '14px', background: 'rgba(255,255,255,0.05)', animationDuration: '2.5s', animationDelay: '0.6s' }}
                />
              </>
            )}
            <div
              className="relative flex items-center justify-center"
              style={{
                width: '88px', height: '88px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.11)',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            >
              {isGranted
                ? <CheckCircleIcon className="w-11 h-11 text-green-300" />
                : isDenied
                ? <XCircleIcon     className="w-11 h-11 text-red-300"   />
                : <MapPinIcon      className="w-11 h-11 text-white"     />
              }
            </div>
          </div>

          <p className="text-white font-bold text-[22px] text-center">
            {isGranted ? 'GPS Active' : isDenied ? 'Location Off' : 'Location Access'}
          </p>
          <p className="text-white/55 text-[13px] text-center mt-1.5 max-w-[220px] leading-snug">
            {isGranted
              ? 'Your location is active. Redirecting…'
              : isDenied
              ? 'You can enable this later in browser settings'
              : isRequesting
              ? 'Respond to the permission dialog above'
              : isChecking
              ? 'Checking permission status…'
              : 'Required for incident reporting and emergency response'}
          </p>
        </div>

        <p className="hidden lg:block text-white/30 text-[11px] tracking-[0.15em] uppercase font-medium self-start">
          ISMSI Secure Gateway&nbsp;•&nbsp;Barangay Bolacan
        </p>
      </div>

      {/* ── Right / Bottom: content ───────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:py-16 lg:overflow-y-auto">
        <div className="w-full max-w-[360px]">

          {/* Checking — no buttons yet, permissions API resolving */}
          {isChecking && (
            <div className="text-center">
              <p className="text-[14px] text-muted">Checking location permission…</p>
            </div>
          )}

          {/* Granted */}
          {isGranted && (
            <div className="text-center">
              <p className="text-[16px] font-semibold text-on-surface mb-1">Location access granted</p>
              <p className="text-[14px] text-muted">Taking you to the app…</p>
            </div>
          )}

          {/* Denied — shown when browser already has it blocked; never calls getCurrentPosition */}
          {isDenied && (
            <>
              <h1 className="text-[28px] font-bold text-on-surface mb-2 tracking-tight">Location Disabled</h1>
              <p className="text-muted text-[15px] leading-relaxed mb-4">
                Location access is blocked. You can still use ISMSI, but incident reports won't auto-fill your location.
              </p>
              <div className="bg-surface rounded-2xl shadow-card px-5 py-4 mb-7 text-[13px] text-muted leading-relaxed">
                To enable: click the <strong className="text-on-surface">lock icon</strong> in your browser's address bar → <strong className="text-on-surface">Site settings</strong> → set Location to <strong className="text-on-surface">Allow</strong>, then reload the page.
              </div>
              <button
                type="button"
                onClick={proceed}
                className="w-full bg-accent text-on-primary font-semibold text-[16px] rounded-xl py-4 hover:opacity-90 active:opacity-80 transition-opacity"
              >
                Continue to App
              </button>
            </>
          )}

          {/* Prompt / Requesting — only shown after permissions API confirms it's grantable */}
          {(stage === 'prompt' || isRequesting) && (
            <>
              <h1 className="text-[28px] font-bold text-on-surface mb-2 tracking-tight">
                Allow Location Access
              </h1>
              <p className="text-muted text-[15px] leading-relaxed mb-7">
                ISMSI needs your location to keep your community safe and help responders reach you faster.
              </p>

              <div className="bg-surface rounded-2xl shadow-card px-6 py-5 mb-7">
                <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-4">
                  Why we need this
                </p>
                <ul className="space-y-3.5">
                  {WHY.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
                        style={{ background: '#1a3d28' }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <span className="text-[14px] text-on-surface leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={handleAllow}
                disabled={isRequesting}
                className="w-full bg-accent text-on-primary font-semibold text-[16px] rounded-xl py-4 flex items-center justify-center gap-2.5 hover:opacity-90 active:opacity-80 transition-opacity mb-3 disabled:opacity-60"
              >
                <MapPinIcon className="w-5 h-5" />
                {isRequesting ? 'Waiting for permission…' : 'Allow Location'}
              </button>

              <button
                type="button"
                onClick={proceed}
                disabled={isRequesting}
                className="w-full py-3.5 text-[15px] font-semibold text-muted hover:text-on-surface transition-colors disabled:opacity-40"
              >
                Skip for now
              </button>
            </>
          )}

          <p className="lg:hidden text-center mt-8 text-[11px] text-placeholder tracking-[0.15em] uppercase font-medium">
            ISMSI Secure Gateway&nbsp;•&nbsp;Barangay Bolacan
          </p>
        </div>
      </div>
    </div>
  )
}
