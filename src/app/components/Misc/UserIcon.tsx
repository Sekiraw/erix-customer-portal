import React from 'react'
import { ServerProps } from 'payload'

const getInitials = (first?: string, last?: string) => {
  const firstInitial = first?.trim()?.[0]?.toUpperCase() || ''
  const lastInitial = last?.trim()?.[0]?.toUpperCase() || ''
  return firstInitial + lastInitial || '?'
}

export const UserIcon = ({ user, i18n }: ServerProps) => {
  const fullName = [user?.lastName, user?.firstName].filter(Boolean).join(' ').trim() || '—'
  const initials = getInitials(user?.firstName, user?.lastName)
  const lang = (i18n?.language as 'hu' | 'en') || 'hu'
  const roleLabel = lang === 'hu' ? 'Adminisztrátor' : 'Administrator'

  return (
    <div className="md:bg-surface bg-background md:rounded-sm">
      <div className="flex flex-row items-center gap-3 py-1.5 pl-2 md:pr-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-400 text-white text-sm font-semibold"
          aria-label={fullName}
        >
          {initials}
        </div>
        <div className="hidden md:flex md:flex-col gap-1 justify-center">
          <div className="text-card-foreground font-bold text-sm m-0 pt-2 leading-2">
            {fullName}
          </div>
          <div className="text-sm text-muted-foreground m-0 p-0">{roleLabel}</div>
        </div>
      </div>
    </div>
  )
}
export default UserIcon
