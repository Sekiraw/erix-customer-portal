'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, TableOfContents } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventsViewSwitcherProps {
  locale: string
}

const translations = {
  en: {
    listView: 'List',
    calendarView: 'Calendar',
  },
  hu: {
    listView: 'Lista',
    calendarView: 'Naptár',
  },
}

export function EventsViewSwitcher({ locale }: EventsViewSwitcherProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentView = searchParams.get('view') || 'list'
  const t = translations[locale as keyof typeof translations] ?? translations.en

  const basePath = pathname || '/admin/collections/events'
  const listParams = new URLSearchParams(searchParams.toString())
  listParams.set('view', 'list')
  const calendarParams = new URLSearchParams(searchParams.toString())
  calendarParams.set('view', 'calendar')
  const listHref = `${basePath}?${listParams.toString()}`
  const calendarHref = `${basePath}?${calendarParams.toString()}`

  return (
    <div className="collection-view-switcher">
      <Link
        href={listHref}
        className={cn(
          'collection-view-switcher__option',
          currentView === 'list' && 'collection-view-switcher__option--active',
        )}
      >
        <TableOfContents className="collection-view-switcher__icon" strokeWidth={1.8} />
        <span className="collection-view-switcher__label">{t.listView}</span>
      </Link>
      <Link
        href={calendarHref}
        className={cn(
          'collection-view-switcher__option',
          currentView === 'calendar' && 'collection-view-switcher__option--active',
        )}
      >
        <CalendarDays className="collection-view-switcher__icon" strokeWidth={1.8} />
        <span className="collection-view-switcher__label">{t.calendarView}</span>
      </Link>
    </div>
  )
}
