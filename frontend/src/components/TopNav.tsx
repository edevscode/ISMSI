import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, BellIcon } from '@heroicons/react/24/outline'
import { UserCircleIcon } from '@heroicons/react/24/solid'

interface TopNavProps {
  title: string
  showBack?: boolean
  showAvatar?: boolean
}

export default function TopNav({ title, showBack = false, showAvatar = false }: TopNavProps) {
  const navigate = useNavigate()

  return (
    <header className="bg-surface border-b border-divider px-5 lg:px-8 py-3.5 grid grid-cols-3 items-center sticky top-0 z-20">
      <div className="flex items-center">
        {showBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="text-muted hover:text-on-surface transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        ) : (
          <img src="/ismsi_brand_logo.png" alt="ISMSI" className="w-7 h-7 object-contain lg:hidden" />
        )}
      </div>

      <h1 className="text-center font-semibold text-on-surface text-[17px] truncate">{title}</h1>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => navigate('/residents/notifications')}
          className="text-muted hover:text-on-surface transition-colors"
        >
          <BellIcon className="w-5 h-5" />
        </button>
        {showAvatar && (
          <div className="w-8 h-8 rounded-full bg-surface-low overflow-hidden flex items-center justify-center">
            <UserCircleIcon className="w-8 h-8 text-outline" />
          </div>
        )}
      </div>
    </header>
  )
}
