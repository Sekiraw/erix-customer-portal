'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Kanban, TableOfContents } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TasksViewSwitcherProps {
  locale: string
}

const translations = {
  en: {
    listView: 'List',
    kanbanView: 'Kanban',
  },
  hu: {
    listView: 'Lista',
    kanbanView: 'Kanban',
  },
}

export function TasksViewSwitcher({ locale }: TasksViewSwitcherProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentView = searchParams.get('view') || 'list'
  const t = translations[locale as keyof typeof translations] ?? translations.en

  const basePath = pathname || '/admin/collections/tasks'
  const listParams = new URLSearchParams(searchParams.toString())
  listParams.set('view', 'list')
  const kanbanParams = new URLSearchParams(searchParams.toString())
  kanbanParams.set('view', 'kanban')
  const listHref = `${basePath}?${listParams.toString()}`
  const kanbanHref = `${basePath}?${kanbanParams.toString()}`

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
        href={kanbanHref}
        className={cn(
          'collection-view-switcher__option',
          currentView === 'kanban' && 'collection-view-switcher__option--active',
        )}
      >
        <Kanban className="collection-view-switcher__icon" strokeWidth={1.8} />
        <span className="collection-view-switcher__label">{t.kanbanView}</span>
      </Link>
    </div>
  )
}
