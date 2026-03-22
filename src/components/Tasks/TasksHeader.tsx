'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { TasksViewSwitcher } from './TasksViewSwitcher'

interface TasksHeaderProps {
  title: string
  newDocumentURL: string
  createLabel: string
  locale: string
  hasCreatePermission?: boolean
}

export function TasksHeader({
  title,
  newDocumentURL,
  createLabel,
  locale,
  hasCreatePermission = true,
}: TasksHeaderProps) {
  return (
    <header className="tasks-header">
      <div className="tasks-header__left">
        <h1 className="tasks-header__title">{title}</h1>
        {hasCreatePermission && (
          <Link href={newDocumentURL} className="tasks-header__create-btn" aria-label={createLabel}>
            <Plus size={18} />
            {createLabel}
          </Link>
        )}
      </div>
      <div className="tasks-header__right">
        <TasksViewSwitcher locale={locale} />
      </div>
    </header>
  )
}
