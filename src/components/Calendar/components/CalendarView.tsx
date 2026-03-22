'use client'

import { BellDot, ChevronLeft, ChevronRight, Presentation } from 'lucide-react'
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  getDay,
  getDaysInMonth,
  getHours,
  isSameDay,
  isSameMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns'
import { enUS, hu } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Fragment, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { CalendarEvent } from '..'
import { EventDialog } from './EventDialog'

const translations = {
  en: {
    day: 'Day',
    week: 'Week',
    month: 'Month',
    today: 'Today',
    prev: 'Previous',
    next: 'Next',
    moreOptions: 'More Options',
    jumpToToday: 'Jump to Today',
    printCaledar: 'Print Calendar',
    more: 'more',
    createEvent: 'Create Event',
    selectedDate: 'Selected date',
  },
  hu: {
    day: 'Nap',
    week: 'Hét',
    month: 'Hónap',
    today: 'Ma',
    prev: 'Előző',
    next: 'Következő',
    moreOptions: 'További lehetőségek',
    jumpToToday: 'Ugrás a mai napra',
    printCaledar: 'Naptár nyomtatása',
    more: 'esemény',
    createEvent: 'Esemény létrehozása',
    selectedDate: 'Kiválasztott dátum',
  },
}

// Props for our calendar component
interface CalendarViewsProps {
  locale: string
  events?: CalendarEvent[]
  onEventMove?: (eventId: string, newDate: Date) => void
  defaultView?: 'day' | 'week' | 'month'
  onViewChange?: (view: 'day' | 'week' | 'month') => void
}

export function CalendarViews({
  locale,
  events = [],
  onEventMove,
  defaultView = 'month',
  onViewChange,
}: CalendarViewsProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.en
  const dateLocale = locale === 'hu' ? hu : enUS
  const monthWeekdays =
    locale === 'hu'
      ? {
          full: ['Vas', 'Hét', 'Ke', 'Sze', 'Csü', 'Pé', 'Szo'],
          short: ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'],
        }
      : {
          full: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          short: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        }

  // State for current view
  const [view, setView] = useState<'day' | 'week' | 'month'>(defaultView)

  // Update parent component when view changes
  const handleViewChange = (newView: 'day' | 'week' | 'month') => {
    setView(newView)
    if (onViewChange) {
      onViewChange(newView)
    }
  }

  // State for drag and drop
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [clickedDate, setClickedDate] = useState<Date | null>(null)

  // Get the days in the current month
  const daysInMonth = getDaysInMonth(currentDate)

  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const startingDayIndex = getDay(firstDayOfMonth)

  // Generate calendar days array with empty cells for proper alignment
  const calendarDays = useMemo(() => {
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayIndex; i++) {
      days.push(null)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      days.push(date)
    }

    return days
  }, [currentDate, daysInMonth, startingDayIndex])

  //   Navigate to previous period based on current view
  const navigatePrevious = () => {
    if (view === 'day') {
      setCurrentDate(subDays(currentDate, 1))
    } else if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      setCurrentDate(subMonths(currentDate, 1))
    }
  }

  // Navigate to next period based on current view
  const navigateNext = () => {
    if (view === 'day') {
      setCurrentDate(addDays(currentDate, 1))
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Handle event click
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEvent(event)
  }

  // Handle cell click (open create dialog)
  const handleCellClick = (date: Date) => {
    setClickedDate(date)
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events
      .filter((event) => isSameDay(new Date(event.date), date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Get events for a specific hour on a specific date
  const getEventsForHour = (date: Date, hour: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return isSameDay(eventDate, date) && getHours(eventDate) === hour
    })
  }

  // Handle drag start - use the actual element as drag image so it looks like you're dragging it
  const handleDragStart = (event: CalendarEvent, e: React.DragEvent) => {
    setDraggedEvent(event)
    e.dataTransfer.setData('text/plain', String(event.id))
    e.dataTransfer.effectAllowed = 'move'

    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    // Use the element itself as drag image - cursor offset from top-left of the element
    e.dataTransfer.setDragImage(target, e.clientX - rect.left, e.clientY - rect.top)
  }

  // Handle drag over
  const handleDragOver = (date: Date, e: React.DragEvent, hour?: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (hour !== undefined) {
      const targetDate = new Date(date)
      targetDate.setHours(hour)
      setIsDraggingOver(targetDate.toISOString())
    } else {
      setIsDraggingOver(date.toISOString())
    }
  }

  // Handle drag leave
  const handleDragLeave = () => {
    setIsDraggingOver(null)
  }

  // Handle drop
  const handleDrop = (date: Date, e: React.DragEvent, hour?: number) => {
    e.preventDefault()
    setIsDraggingOver(null)

    if (!draggedEvent || !onEventMove) return

    const originalTime = new Date(draggedEvent.date)
    const originalMinutes = originalTime.getMinutes()
    const originalSeconds = originalTime.getSeconds()

    const newDate = new Date(date)

    if (hour !== undefined) {
      newDate.setHours(hour, originalMinutes, originalSeconds, 0)
    } else {
      newDate.setHours(originalTime.getHours(), originalMinutes, originalSeconds, 0)
    }

    onEventMove(String(draggedEvent.id), newDate)
    setDraggedEvent(null)
  }

  // Render the appropriate view based on the current view state
  const renderView = () => {
    switch (view) {
      case 'day':
        return renderDayView()
      case 'week':
        return renderWeekView()
      case 'month':
      default:
        return renderMonthView()
    }
  }

  // Render the day view
  const renderDayView = () => {
    // Generate hours for the day
    const start = 0
    const end = 23
    const length = end - start + 1
    const hours = Array.from({ length }, (_, i) => i + start)

    return (
      <div className="overflow-y-auto max-h-[calc(100vh-200px)] bg-white">
        <div className="grid grid-cols-1 min-w-full">
          {hours.map((hour) => {
            const hourDate = new Date(currentDate)
            hourDate.setHours(hour)
            hourDate.setMinutes(0, 0, 0)
            const hourEvents: CalendarEvent[] = getEventsForHour(currentDate, hour)
            const hourLabel = format(hourDate, 'HH:mm', { locale: dateLocale })

            return (
              <div
                key={`day-${hour}`}
                className={cn(
                  'grid grid-cols-[60px_1fr] border-b border-input min-h-[60px]',
                  isDraggingOver === hourDate.toISOString() && 'bg-primary/10',
                  'hover:bg-muted/50 cursor-pointer',
                )}
                onDragOver={(e) => handleDragOver(currentDate, e, hour)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(currentDate, e, hour)}
                onClick={() => handleCellClick(hourDate)}
              >
                <div className="py-2 px-2 text-xs text-muted-foreground border-r border-input">
                  {hourLabel}
                </div>
                <div className="p-1 relative">
                  {hourEvents.map((event: CalendarEvent) => (
                    <div
                      key={`day-${event.id}`}
                      className={cn(
                        'text-sm p-1 mb-1 rounded flex flex-row items-center justify-between cursor-grab active:cursor-grabbing text-white',
                        event.type === 'meeting' ? 'bg-chart-4' : 'bg-chart-5',
                      )}
                      onClick={(e) => handleEventClick(event, e)}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(event, e)}
                    >
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm">
                          {format(new Date(event.date), 'HH:mm', { locale: dateLocale })}
                        </div>
                      </div>
                      {event.type === 'meeting' ? (
                        <Presentation size={16} />
                      ) : (
                        <BellDot size={16} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Render the week view
  const renderWeekView = () => {
    // Get the start and end of the week
    const startDate = startOfWeek(currentDate)
    const endDate = endOfWeek(currentDate)

    // Get all days in the week
    const daysInWeek = eachDayOfInterval({ start: startDate, end: endDate })

    // Generate hours for each day
    const start = 0
    const end = 23
    const length = end - start + 1
    const hours = Array.from({ length }, (_, i) => i + start)

    return (
      <div className="overflow-auto max-h-[calc(100vh-200px)] bg-white">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] min-w-full">
          {/* Header row with day names */}
          <div className="sticky top-0 z-10 bg-background border-b border-input">
            <div className="h-14"></div>
          </div>
          {daysInWeek.map((day) => (
            <div
              key={`week-par-${day.toString()}`}
              className="sticky top-0 z-10 bg-background border-b border-r border-input text-center p-2"
            >
              <div className="text-sm font-medium">
                {format(day, 'EEE', { locale: dateLocale })}
              </div>
              <div
                className={cn(
                  'text-sm',
                  isSameDay(day, new Date()) &&
                    'bg-primary text-primary-foreground rounded-full w-7 h-7 mx-auto flex items-center justify-center',
                )}
              >
                {format(day, 'd', { locale: dateLocale })}
              </div>
            </div>
          ))}

          {/* Time grid */}
          {hours.map((hour) => (
            <Fragment key={`week-${hour}`}>
              {/* Hour label */}
              <div className="py-2 px-2 text-xs text-muted-foreground border-r border-b border-input min-h-[60px]">
                {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm', { locale: dateLocale })}
              </div>

              {/* Hour cells for each day */}
              {daysInWeek.map((day) => {
                const cellDate = new Date(day)
                cellDate.setHours(hour)
                const hourEvents = getEventsForHour(day, hour)

                return (
                  <div
                    key={`week-${day.toString()}-${hour}`}
                    className={cn(
                      'border-r border-b border-input p-1 min-h-[60px] relative',
                      isDraggingOver === cellDate.toISOString() && 'bg-primary/10',
                      'hover:bg-muted/50 cursor-pointer',
                    )}
                    onDragOver={(e) => handleDragOver(day, e, hour)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(day, e, hour)}
                    onClick={() => handleCellClick(cellDate)}
                  >
                    {hourEvents.map((event) => (
                      <div
                        key={`week-el-${event.id}`}
                        className={cn(
                          'text-sm p-1 mb-1 flex flex-row items-center justify-between rounded cursor-grab active:cursor-grabbing text-white',
                          event.type === 'meeting' ? 'bg-chart-4' : 'bg-chart-5',
                        )}
                        onClick={(e) => handleEventClick(event, e)}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(event, e)}
                      >
                        <div>
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-sm">
                            {format(new Date(event.date), 'HH:mm', { locale: dateLocale })}
                          </div>
                        </div>
                        {event.type === 'meeting' ? (
                          <Presentation size={16} />
                        ) : (
                          <BellDot size={16} />
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    )
  }

  // Render the month view
  const renderMonthView = () => {
    return (
      <div className="calendar-grid">
        {monthWeekdays.full.map((day) => (
          <div key={`month-${day}`} className="cal-day-header">
            {day}
          </div>
        ))}

        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="cal-cell bg-muted/20" />
          }

          const dateEvents = getEventsForDate(day)
          const isToday = isSameDay(day, new Date())
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const isCurrentMonth = isSameMonth(day, currentDate)

          return (
            <div
              key={`month-el-${day.toString()}`}
              className={cn(
                'cal-cell overflow-hidden cursor-pointer',
                isToday && 'today',
                isSelected && 'bg-primary/10',
                !isCurrentMonth && 'text-muted-foreground',
                isDraggingOver === day.toISOString() && 'bg-primary/20',
              )}
              onDragOver={(e) => handleDragOver(day, e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(day, e)}
              onClick={() => handleCellClick(day)}
            >
              <div className="cal-day-num">{format(day, 'd', { locale: dateLocale })}</div>

              {dateEvents.map((event: CalendarEvent) => (
                <div
                  key={`month-event-${event.id}`}
                  className={cn(
                    'event-chip cursor-grab active:cursor-grabbing',
                    event.type === 'meeting' ? 'meeting' : 'reminder',
                  )}
                  onClick={(e) => handleEventClick(event, e)}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(event, e)}
                >
                  <span>
                    {format(new Date(event.date), 'HH:mm', { locale: dateLocale })}{' '}
                    {event.title.length > 22 ? `${event.title.slice(0, 22)}...` : event.title}
                  </span>
                  {event.type === 'meeting' ? <Presentation size={16} /> : <BellDot size={16} />}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="calendar-wrap w-full max-w-full overflow-hidden">
      {/* Toolbar */}
      <div className="calendar-toolbar">
        <div className="calendar-month">
          {view === 'day'
            ? format(currentDate, 'yyyy, MMMM d', { locale: dateLocale })
            : view === 'week'
              ? `${format(startOfWeek(currentDate), 'yyyy, MMM d', { locale: dateLocale })} - ${format(endOfWeek(currentDate), 'MMM d', { locale: dateLocale })}`
              : format(currentDate, 'yyyy MMMM', { locale: dateLocale })}
        </div>
        <div className="calendar-controls">
          <div className="cal-mode-group">
            <button
              className={cn('cal-mode-btn', view === 'day' && 'active')}
              onClick={() => handleViewChange('day')}
            >
              {t.day}
            </button>
            <button
              className={cn('cal-mode-btn', view === 'week' && 'active')}
              onClick={() => handleViewChange('week')}
            >
              {t.week}
            </button>
            <button
              className={cn('cal-mode-btn', view === 'month' && 'active')}
              onClick={() => handleViewChange('month')}
            >
              {t.month}
            </button>
          </div>
          <button type="button" className="cal-today-btn" onClick={goToToday}>
            {t.today}
          </button>
          <button
            type="button"
            className="cal-nav-btn"
            onClick={navigatePrevious}
            aria-label={t.prev}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" className="cal-nav-btn" onClick={navigateNext} aria-label={t.next}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      {renderView()}

      {/* Event Dialog */}
      {selectedEvent && (
        <EventDialog
          isOpen={selectedEvent !== null}
          onClose={() => {
            setSelectedEvent(null)
          }}
          event={selectedEvent}
          locale={locale}
        />
      )}

      {/* Create Event Dialog */}
      <Dialog
        open={clickedDate !== null}
        onOpenChange={(open) => {
          if (!open) setClickedDate(null)
        }}
      >
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>
              {clickedDate
                ? format(clickedDate, view === 'month' ? 'yyyy. MM. dd.' : 'yyyy. MM. dd. HH:mm', {
                    locale: dateLocale,
                  })
                : ''}
            </DialogTitle>
          </DialogHeader>
          <button
            className="flex items-center flex-row gap-2 rounded-md border border-input px-4 py-3 font-medium hover:bg-ring transition-colors w-full hover:cursor-pointer"
            onClick={() => {
              if (!clickedDate) return
              const date = new Date(clickedDate)
              if (view === 'month') date.setHours(9, 0, 0, 0)
              const url = `/admin/collections/events/create?startTime=${encodeURIComponent(date.toISOString())}`
              setClickedDate(null)
              if (window.top) {
                window.top.location.href = url
              }
            }}
          >
            <Plus size={16} />
            {t.createEvent}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
