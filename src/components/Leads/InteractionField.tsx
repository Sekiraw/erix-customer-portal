'use client'

import { Task, Event } from '@/payload-types'
import { ChevronRight, Presentation, BellDot, Plus } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

interface Props {
  tasks: Task[]
  events: Event[]
  locale: string
}

const translations = {
  en: {
    tasks: 'Tasks',
    noTasks: 'No tasks',
    events: 'Events',
    noEvents: 'No events',
    createTask: 'New Task',
    createEvent: 'New Event',
  },
  hu: {
    tasks: 'Feladatok',
    noTasks: 'Nincs feladat',
    events: 'Események',
    noEvents: 'Nincs esemény',
    createTask: 'Új feladat',
    createEvent: 'Új esemény',
  },
}

function SectionHeader({
  title,
  createLabel,
  createUrl,
}: {
  title: string
  createLabel: string
  createUrl: string
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="flex items-center justify-between mb-2">
      <p className="text-lg font-semibold">{title}</p>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current bg-transparent hover:bg-ring p-0 m-0 leading-none"
        >
          <Plus size={12} className="h-3 w-3 text-black shrink-0" />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 z-50 min-w-[100px] rounded border-none shadow-lg bg-white">
            <a
              href={createUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 text-center text-black no-underline"
              onClick={() => setOpen(false)}
            >
              {createLabel}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export const LeadInteractionsClient = ({ tasks, events, locale }: Props) => {
  const t = translations[locale as keyof typeof translations] ?? translations.en

  return (
    <div className="flex flex-col gap-6">
      {/* TASKS */}
      <section>
        <SectionHeader
          title={t.tasks}
          createLabel={t.createTask}
          createUrl="/admin/collections/tasks/create"
        />

        {tasks.length === 0 && <p className="text-sm text-muted-foreground">{t.noTasks}</p>}

        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <Row
              key={task.id}
              title={task.title}
              onClick={() => (window.top!.location.href = `/admin/collections/tasks/${task.id}`)}
              icon={<ChevronRight size={16} />}
            />
          ))}
        </div>
      </section>

      {/* EVENTS */}
      <section>
        <SectionHeader
          title={t.events}
          createLabel={t.createEvent}
          createUrl="/admin/collections/events/create"
        />

        {events.length === 0 && <p className="text-sm text-muted-foreground">{t.noEvents}</p>}

        <div className="flex flex-col gap-2">
          {events.map((event) => (
            <EventRow
              key={event.id}
              title={event.title}
              onClick={() => (window.top!.location.href = `/admin/collections/events/${event.id}`)}
              icon={
                event.type === 'meeting' ? (
                  <Presentation size={16} className="text-chart-4" />
                ) : (
                  <BellDot size={16} className="text-chart-5" />
                )
              }
              date={
                event.type === 'meeting' ? new Date(event.startTime!) : new Date(event.notifyAt!)
              }
              locale={locale}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

const Row = ({
  title,
  onClick,
  icon,
}: {
  title: string
  onClick: () => void
  icon: React.ReactNode
}) => (
  <div
    className="flex justify-between items-center rounded-md cursor-pointer border border-muted/30 hover:border-muted transition-colors py-3 pl-1"
    onClick={onClick}
  >
    <p className="text-lg pl-2">{title}</p>
    <div className="pr-3 flex items-center">{icon}</div>
  </div>
)

const EventRow = ({
  title,
  onClick,
  icon,
  date,
  locale,
}: {
  title: string
  onClick: () => void
  icon?: React.ReactNode
  date: Date
  locale: string
}) => {
  const localeCode = locale === 'hu' ? 'hu-HU' : 'en-US'

  const formattedDate = date.toLocaleDateString(localeCode, {
    month: '2-digit',
    day: '2-digit',
  })
  const formattedTime = date.toLocaleTimeString(localeCode, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return (
    <div
      className="flex justify-between items-center rounded-md cursor-pointer border border-muted/30 hover:border-muted transition-colors py-1 pl-1"
      onClick={onClick}
    >
      <div className="flex items-center flex-row gap-3 p-2">
        <div className="flex items-center">{icon}</div>
        <p className="text-lg flex items-center">{title}</p>
      </div>
      <div className="pr-3">
        <p>
          {formattedDate} {formattedTime}
        </p>
      </div>
    </div>
  )
}
