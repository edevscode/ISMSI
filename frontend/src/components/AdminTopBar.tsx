import {
  MagnifyingGlassIcon,
  RssIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline'

const INTER: React.CSSProperties = { fontFamily: 'Inter, sans-serif' }

interface Props {
  searchPlaceholder?: string
  /** Content between the action icons and the avatar (e.g. datetime on Dashboard) */
  midSlot?: React.ReactNode
  /** Content after the avatar (e.g. live-incidents badge on Incident Center) */
  rightSlot?: React.ReactNode
  /** Called when the mobile hamburger button is tapped */
  onMenuClick?: () => void
}

export default function AdminTopBar({
  searchPlaceholder = 'Search...',
  midSlot,
  rightSlot,
  onMenuClick,
}: Props) {
  return (
    <header style={{ height: '64px', background: '#1f2020', borderBottom: '1px solid #434843', display: 'flex', alignItems: 'center', gap: '14px', padding: '0 20px', flexShrink: 0 }}>

      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center w-8 h-8 rounded hover:bg-cc-surface transition-colors shrink-0"
        aria-label="Open menu"
      >
        <Bars3Icon style={{ width: '20px', height: '20px', color: '#8d928c' }} />
      </button>

      {/* Brand title — hidden on small mobile to save space */}
      <span className="hidden sm:block" style={{ color: '#e4e2e1', fontWeight: 700, fontSize: '17px', letterSpacing: '-0.01em', whiteSpace: 'nowrap', ...INTER }}>
        ISMSI Command
      </span>

      {/* Search — hidden on very small screens */}
      <div className="hidden sm:flex" style={{ flex: 1, maxWidth: '400px', alignItems: 'center', gap: '8px', background: '#0e0e0e', border: '1px solid #434843', borderRadius: '4px', padding: '0 12px', height: '36px' }}>
        <MagnifyingGlassIcon style={{ width: '14px', height: '14px', color: '#8d928c', flexShrink: 0 }} />
        <input
          placeholder={searchPlaceholder}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e4e2e1', fontSize: '13px', ...INTER }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Fixed action icons */}
      <RssIcon style={{ width: '19px', height: '19px', color: '#8d928c', cursor: 'pointer', flexShrink: 0 }} />
      <Cog6ToothIcon className="hidden sm:block" style={{ width: '19px', height: '19px', color: '#8d928c', cursor: 'pointer' }} />

      {/* Mid slot — between icons and avatar */}
      {midSlot}

      {/* Avatar */}
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#252626', border: '1px solid #434843', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
        <UserCircleIcon style={{ width: '20px', height: '20px', color: '#8d928c' }} />
      </div>

      {/* Right slot — after avatar */}
      {rightSlot}
    </header>
  )
}
