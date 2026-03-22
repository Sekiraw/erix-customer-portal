'use server'

import { getUser } from '@/lib/auth/user'
import { Gutter } from '@payloadcms/ui'
import { Event } from '@/payload-types'
import CalendarEntry from './components/CalendarEntry'

const translations = {
  en: {
    authRequired: 'You must be logged in to view this page.',
  },
  hu: {
    authRequired: 'A felület megtekintéséhez be kell jelentkezned.',
  },
}

export type CalendarEvent = Event & {
  date: string | Date
}

// Defining the props as PageProps will cause a build error, so we use any here
export const Calendar = async (props: any) => {
  const { user, payload } = await getUser()
  const locale = props.i18n.language
  const t = translations[locale as keyof typeof translations] ?? translations.en

  if (!user) {
    return <div>{t.authRequired}</div>
  }

  // Fetch all necessary data
  const [eventsResult] = await Promise.all([
    payload.find({
      collection: 'events',
      pagination: false,
      depth: 1,
    }),
  ])

  // Filter and sort events by their respective time field
  const events: CalendarEvent[] = (eventsResult.docs as Event[]).flatMap((event) => {
    const date = event.type === 'meeting' ? event.startTime : event.notifyAt
    if (date == null) return []

    return [
      {
        ...event,
        date,
      },
    ]
  })

  return (
    <Gutter>
      <CalendarEntry defaultEvents={events} locale={locale} />
    </Gutter>
  )
}
