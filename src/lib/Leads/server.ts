'use server'

import { getUser } from '../auth/user'
import { Event, Task } from '@/payload-types'

export type LeadInteractions = {
  tasks: Task[]
  events: Event[]
}

export async function getInteractionsByLeadId(leadId: number): Promise<LeadInteractions> {
  const { user, payload } = await getUser()

  if (!user) {
    payload.logger.error('No user found')
    return {
      tasks: [],
      events: [],
    }
  }

  const [tasksResult, eventsResult] = await Promise.all([
    payload.find({
      collection: 'tasks',
      pagination: false,
      where: {
        leadsEntry: { equals: leadId },
      },
      limit: 5,
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'events',
      pagination: false,
      where: {
        leadsEntry: { equals: leadId },
      },
      limit: 5,
      sort: '-createdAt',
    }),
  ])

  return {
    tasks: tasksResult.docs,
    events: eventsResult.docs,
  }
}
