'use client'

import { format } from 'date-fns'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { enUS, hu } from 'date-fns/locale'
import { CalendarEvent } from '..'
import {
  BellDot,
  Calendar,
  Clock,
  Link2,
  Presentation,
  SquareArrowOutUpRight,
  Users,
  X,
} from 'lucide-react'
import { Lead, User } from '@/payload-types'

const translations = {
  en: {
    jumpToEvent: 'Jump to Event',
    createdAt: 'Created at',
    time: 'Time',
    parties: 'Parties',
    guests: 'Guests',
    lead: 'Lead',
  },
  hu: {
    jumpToEvent: 'Esemény megtekintése',
    createdAt: 'Létrehozva',
    time: 'Időpont',
    parties: 'Értesített személyek',
    guests: 'Vendégek',
    lead: 'Lead',
  },
}

interface EventDialogProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEvent
  locale: string
}

export function EventDialog({ isOpen, onClose, event, locale }: EventDialogProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.en
  const dateLocale = locale === 'hu' ? hu : enUS
  const isMeeting = event.type === 'meeting'
  const parties = isMeeting ? event.guests : event.parties

  const partyLabels = (parties ?? []).map((party) => {
    if (typeof party === 'number') return `User #${party}`
    return party.email ?? `User #${party.id}`
  })
  const partiesValue = partyLabels.join(', ')

  const timeValue = isMeeting
    ? `${format(new Date(event.startTime!), 'yyyy. MM. dd.', { locale: dateLocale })} ${format(new Date(event.startTime!), 'HH:mm', { locale: dateLocale })} - ${format(new Date(event.endTime ?? event.startTime!), 'HH:mm', { locale: dateLocale })}`
    : format(new Date(event.notifyAt!), 'yyyy. MM. dd. HH:mm', { locale: dateLocale })

  const createdByEmail = event.createdBy
    ? ((event.createdBy as User).email?.split('@')[0] ?? '')
    : ''

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="p-0! border-0! shadow-none! bg-transparent! max-w-[420px]!"
      >
        <div className="event-popover">
          <DialogTitle className="sr-only">{event.title}</DialogTitle>
          <button type="button" className="popover-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>

          <div className="popover-title-row">
            <span className="popover-title">{event.title}</span>
            <span className={`popover-type-badge ${isMeeting ? 'meeting' : 'reminder'}`}>
              {isMeeting ? <Presentation size={16} /> : <BellDot size={16} />}
            </span>
          </div>

          <div className="popover-meta">
            <Clock size={14} />
            {t.createdAt}:{' '}
            {event.createdAt &&
              format(new Date(event.createdAt), 'yyyy.MM.dd.', { locale: dateLocale })}
            {createdByEmail && <span className="popover-meta-user">{createdByEmail}</span>}
          </div>

          <div className="popover-fields">
            <div className="popover-field">
              <Calendar size={18} className="popover-field-icon" />
              <span className="popover-field-label">{t.time}</span>
              <span className="popover-field-value">{timeValue}</span>
            </div>

            {partiesValue && partiesValue.length > 0 && (
              <div className="popover-field">
                <Users size={18} className="popover-field-icon" />
                <span className="popover-field-label">{isMeeting ? t.guests : t.parties}</span>
                <span className="popover-field-value">{partiesValue}</span>
              </div>
            )}

            {event.leadsEntry && (
              <div className="popover-field">
                <Link2 size={18} className="popover-field-icon" />
                <span className="popover-field-label">{t.lead}</span>
                <span className="popover-field-value">
                  <a href={`/admin/collections/leads/${(event.leadsEntry as Lead).id}`}>
                    {(event.leadsEntry as Lead).title || `Lead #${(event.leadsEntry as Lead).id}`}
                  </a>
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn-jump"
            onClick={() => {
              if (window.top) {
                window.top.location.href = `/admin/collections/events/${event.id}`
              }
            }}
          >
            {t.jumpToEvent}
            <SquareArrowOutUpRight size={14} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
