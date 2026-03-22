'use server'

import { getUser } from '@/lib/auth/user'
import type { CalendarEvent } from '@/components/Calendar'

export async function moveEvent(eventId: string, newDate: Date): Promise<CalendarEvent | null> {
  const { user, payload } = await getUser()

  if (!user) {
    payload.logger.error('No user found')
    return null
  }

  const numericId = Number(eventId)
  if (Number.isNaN(numericId)) {
    payload.logger.error('Invalid event ID')
    return null
  }

  try {
    const event = await payload.findByID({
      collection: 'events',
      id: numericId,
      depth: 1,
    })

    if (!event) {
      payload.logger.error('Event not found')
      return null
    }

    const updateData: Record<string, string> = {}

    if (event.type === 'meeting') {
      const originalStart = event.startTime ? new Date(event.startTime) : new Date()
      const originalEnd = event.endTime ? new Date(event.endTime) : originalStart
      const durationMs = Math.max(0, originalEnd.getTime() - originalStart.getTime())

      const newStart = new Date(newDate)
      const newEnd = new Date(newStart.getTime() + durationMs)

      updateData.startTime = newStart.toISOString()
      updateData.endTime = newEnd.toISOString()
    } else {
      // notification
      updateData.notifyAt = new Date(newDate).toISOString()
    }

    const updated = await payload.update({
      collection: 'events',
      id: numericId,
      data: updateData,
    })

    const date = updated.type === 'meeting' ? updated.startTime : updated.notifyAt
    return {
      ...updated,
      date: date ?? new Date(),
    } as CalendarEvent
  } catch (err) {
    payload.logger.error(`Failed to move event ${eventId}:`, err as any)
    return null
  }
}
