'use client'

import { useEffect, useState } from 'react'
import { CalendarViews } from './CalendarView'
import { CalendarEvent } from '..'
import { moveEvent } from '@/lib/Events/server'

interface CalendarEntryProps {
  defaultEvents: CalendarEvent[]
  locale: string
}

export default function CalendarEntry({ defaultEvents, locale }: CalendarEntryProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])

  // This useEffect ensures that the events are set after the component mounts,
  // addressing potential hydration mismatches between server-rendered and client-rendered content.
  useEffect(() => {
    setEvents(defaultEvents)
  }, [defaultEvents])

  // Handle event move - optimistic update + server sync
  const handleEventMove = async (eventId: string, newDate: Date) => {
    const eventToUpdate = events.find((e) => String(e.id) === eventId)
    if (!eventToUpdate) return

    // Optimistic update - for meetings, preserve duration (endTime - startTime)
    const originalStart = new Date(eventToUpdate.date)
    const durationMs =
      eventToUpdate.type === 'meeting' && eventToUpdate.endTime
        ? Math.max(0, new Date(eventToUpdate.endTime).getTime() - originalStart.getTime())
        : 0

    const updatedEvent: CalendarEvent = {
      ...eventToUpdate,
      date: newDate,
      ...(eventToUpdate.type === 'meeting' && {
        endTime: new Date(newDate.getTime() + durationMs).toISOString(),
      }),
    }

    setEvents((prev) => prev.map((e) => (String(e.id) === eventId ? updatedEvent : e)))

    const result = await moveEvent(eventId, newDate)
    if (result) {
      setEvents((prev) => prev.map((e) => (String(e.id) === eventId ? result : e)))
    } else {
      // Revert on failure
      setEvents((prev) => prev.map((e) => (String(e.id) === eventId ? eventToUpdate : e)))
    }
  }

  return (
    <div className="w-full py-4">
      <CalendarViews events={events} onEventMove={handleEventMove} locale={locale} />
    </div>
  )
}
