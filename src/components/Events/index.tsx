'use server'

import { getUser } from '@/lib/auth/user'
import { DefaultListView, Gutter } from '@payloadcms/ui'
import { Event } from '@/payload-types'
import { EventsHeader } from './EventsHeader'
import CalendarEntry from '@/components/Calendar/components/CalendarEntry'
import type { CalendarEvent } from '@/components/Calendar'

const translations = {
  en: {
    authRequired: 'You must be logged in to view this page.',
    createLabel: 'Add',
  },
  hu: {
    authRequired: 'A felület megtekintéséhez be kell jelentkezned.',
    createLabel: 'Hozzáadás',
  },
}

// Defining the props as PageProps will cause a build error, so we use any here
export const Events = async (props: any) => {
  const { user, payload } = await getUser()
  const locale = props.i18n.language
  const t = translations[locale as keyof typeof translations] ?? translations.en

  if (!user) {
    return <div>{t.authRequired}</div>
  }

  const params = await props.searchParams!
  const currentView = params?.view || 'list'

  const title = props.collectionConfig.labels.plural[locale]

  return (
    <div className="events-view tasks-view">
      <Gutter>
        <EventsHeader
          title={title}
          newDocumentURL={props.newDocumentURL}
          createLabel={t.createLabel}
          locale={locale}
          hasCreatePermission={props.hasCreatePermission}
        />
      </Gutter>

      {currentView === 'list' ? (
        <DefaultListView
          collectionSlug={props.collectionSlug}
          columnState={props.columnState}
          hasCreatePermission={props.hasCreatePermission}
          newDocumentURL={props.newDocumentURL}
          viewType={props.viewType}
          Table={props.Table}
        />
      ) : (
        <CalendarView
          payload={payload}
          locale={locale}
          newDocumentURL={props.newDocumentURL}
          title={title}
        />
      )}
    </div>
  )
}

async function CalendarView({
  payload,
  locale,
  newDocumentURL,
  title,
}: {
  payload: any
  locale: string
  newDocumentURL: string
  title: string
}) {
  const eventsResult = await payload.find({
    collection: 'events',
    pagination: false,
    depth: 1,
  })

  const events: CalendarEvent[] = (eventsResult.docs as Event[]).flatMap((event) => {
    const date = event.type === 'meeting' ? event.startTime : event.notifyAt
    if (date == null) return []
    return [{ ...event, date }]
  })

  return (
    <Gutter>
      <CalendarEntry defaultEvents={events} locale={locale} />
    </Gutter>
  )
}
