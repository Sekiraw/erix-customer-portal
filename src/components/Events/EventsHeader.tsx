'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { EventsViewSwitcher } from './EventsViewSwitcher'

interface EventsHeaderProps {
  title: string
  newDocumentURL: string
  createLabel: string
  locale: string
  hasCreatePermission?: boolean
}

export function EventsHeader({
  title,
  newDocumentURL,
  createLabel,
  locale,
  hasCreatePermission = true,
}: EventsHeaderProps) {
  return (
    <header className="events-header">
      <div className="events-header__left">
        <h1 className="events-header__title">{title}</h1>
        {hasCreatePermission && (
          <Link
            href={newDocumentURL}
            className="events-header__create-btn"
            aria-label={createLabel}
          >
            <Plus size={18} />
            {createLabel}
          </Link>
        )}
      </div>
      <div className="events-header__right">
        <EventsViewSwitcher locale={locale} />
      </div>
    </header>
  )
}
