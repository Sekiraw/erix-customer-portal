'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { hu } from 'date-fns/locale'
import { Event } from '@/payload-types'
import type { DateRange } from 'react-day-picker'
import {
  ChevronLeft,
  ChevronRight,
  UserRoundPlus,
  ClipboardClock,
  CircleCheckBig,
  FileBadge,
  Presentation,
  BellDot,
  CalendarRange,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardStats {
  newLeads: {
    devops: number
    uzemeltetes: number
    fejlesztes: number
  }
  offers: {
    sent: number
    awaiting: number
  }
  deadlines: {
    upcoming: number
    overdue: number
  }
  taskStats: {
    new: number
    inProgress: number
    closed: number
    delayed: number
  }
}

interface DashboardClientProps {
  userName: string
  stats: DashboardStats
  events: Event[]
  locale: string
}

const translations = {
  en: {
    greeting: 'Hello',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    newLeads: 'New Leads',
    offers: 'Offers',
    deadlines: 'Deadlines',
    tasks: 'Tasks',
    events: 'Events',
    sent: 'Sent',
    awaitingOffer: 'Awaiting Offer',
    upcoming: 'Upcoming',
    overdue: 'Overdue',
    new: 'New',
    inProgress: 'In Progress',
    closed: 'Closed',
    delayed: 'Delayed',
    noEvents: 'No upcoming events',
  },
  hu: {
    greeting: 'Hello',
    today: 'Mai nap',
    thisWeek: 'Ez a hét',
    thisMonth: 'Ez a hónap',
    newLeads: 'Új leadek',
    offers: 'Ajánlatok',
    deadlines: 'Határidők',
    tasks: 'Feladatok',
    events: 'Események',
    sent: 'Kiküldött',
    awaitingOffer: 'Ajánlatra vár',
    upcoming: 'Közelgő',
    overdue: 'Lejárt',
    new: 'Új',
    inProgress: 'Folyamatban',
    closed: 'Lezárt',
    delayed: 'Elhalasztva',
    noEvents: 'Nincsenek közelgő események',
  },
}

export function DashboardClient({ userName, stats, events, locale }: DashboardClientProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.en
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedFilter =
    (searchParams.get('filter') as 'today' | 'thisWeek' | 'thisMonth' | 'custom') || 'today'
  const [eventsPage, setEventsPage] = useState(0)
  const [dateRangeOpen, setDateRangeOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const eventsPerPage = 4
  const totalPages = Math.ceil(events.length / eventsPerPage)
  const paginatedEvents = events.slice(eventsPage * eventsPerPage, (eventsPage + 1) * eventsPerPage)

  // Load filter from localStorage on mount or use URL params
  useEffect(() => {
    const urlFilter = searchParams.get('filter')

    if (!urlFilter) {
      // No filter in URL, check localStorage
      const savedFilter = window.localStorage.getItem('dashboardFilter')
      const savedStartDate = window.localStorage.getItem('dashboardStartDate')
      const savedEndDate = window.localStorage.getItem('dashboardEndDate')

      if (savedFilter) {
        const params = new URLSearchParams()
        params.set('filter', savedFilter)

        if (savedFilter === 'custom' && savedStartDate && savedEndDate) {
          params.set('startDate', savedStartDate)
          params.set('endDate', savedEndDate)
        }

        router.replace(`?${params.toString()}`)
      }
    } else {
      // Save current URL params to localStorage
      window.localStorage.setItem('dashboardFilter', urlFilter)

      if (urlFilter === 'custom') {
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        if (startDate) window.localStorage.setItem('dashboardStartDate', startDate)
        if (endDate) window.localStorage.setItem('dashboardEndDate', endDate)
      } else {
        window.localStorage.removeItem('dashboardStartDate')
        window.localStorage.removeItem('dashboardEndDate')
      }
    }
  }, [searchParams, router])

  const handleFilterChange = (filter: 'today' | 'thisWeek' | 'thisMonth' | 'custom') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('filter', filter)
    params.delete('startDate')
    params.delete('endDate')

    // Save to localStorage
    window.localStorage.setItem('dashboardFilter', filter)
    window.localStorage.removeItem('dashboardStartDate')
    window.localStorage.removeItem('dashboardEndDate')

    router.push(`?${params.toString()}`)
  }

  const handleDateRangeApply = () => {
    if (dateRange?.from && dateRange?.to) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('filter', 'custom')
      const startDate = format(dateRange.from, 'yyyy-MM-dd')
      const endDate = format(dateRange.to, 'yyyy-MM-dd')
      params.set('startDate', startDate)
      params.set('endDate', endDate)

      // Save to localStorage
      window.localStorage.setItem('dashboardFilter', 'custom')
      window.localStorage.setItem('dashboardStartDate', startDate)
      window.localStorage.setItem('dashboardEndDate', endDate)

      router.push(`?${params.toString()}`)
      setDateRangeOpen(false)
    }
  }

  const handlePopoverOpenChange = (open: boolean) => {
    setDateRangeOpen(open)

    // When opening, sync dateRange with URL params if custom filter is active
    if (open && selectedFilter === 'custom') {
      const startDate = searchParams.get('startDate')
      const endDate = searchParams.get('endDate')

      if (startDate && endDate) {
        setDateRange({
          from: new Date(startDate),
          to: new Date(endDate),
        })
      }
    }
  }

  return (
    <div className="md:mt-8 mt-4">
      {/* Header */}
      <div className="flex md:flex-row items-center justify-between mb-8">
        <h1 className="text-4xl font-normal text-gray-700">
          {t.greeting} {userName},
        </h1>
        <div className="flex md:flex-row gap-2 flex-col">
          <Button
            variant="outline"
            onClick={() => handleFilterChange('today')}
            className={
              selectedFilter === 'today' ? 'text-chart-4 border-chart-4' : 'text-ring border-ring'
            }
          >
            <p className="text-lg p-1 font-normal">{t.today}</p>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleFilterChange('thisWeek')}
            className={
              selectedFilter === 'thisWeek'
                ? 'text-chart-4 border-chart-4'
                : 'text-ring border-ring'
            }
          >
            <p className="text-lg p-1 font-normal">{t.thisWeek}</p>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleFilterChange('thisMonth')}
            className={
              selectedFilter === 'thisMonth'
                ? 'text-chart-4 border-chart-4'
                : 'text-ring border-ring'
            }
          >
            <p className="text-lg p-1 font-normal">{t.thisMonth}</p>
          </Button>
          <Popover open={dateRangeOpen} onOpenChange={handlePopoverOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={
                  selectedFilter === 'custom'
                    ? 'text-chart-4 border-chart-4'
                    : 'text-ring border-ring'
                }
              >
                {selectedFilter === 'custom' &&
                searchParams.get('startDate') &&
                searchParams.get('endDate') ? (
                  <p className="text-lg p-1 font-normal">
                    {searchParams.get('startDate') === searchParams.get('endDate') ? (
                      format(new Date(searchParams.get('startDate')!), 'yyyy.MM.dd.', {
                        locale: hu,
                      })
                    ) : (
                      <>
                        {format(new Date(searchParams.get('startDate')!), 'yyyy.MM.dd.', {
                          locale: hu,
                        })}{' '}
                        -{' '}
                        {format(new Date(searchParams.get('endDate')!), 'yyyy.MM.dd.', {
                          locale: hu,
                        })}
                      </>
                    )}
                  </p>
                ) : (
                  <CalendarRange className="h-5 w-5" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex flex-col gap-4 p-4">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={hu}
                />
                <Button
                  onClick={handleDateRangeApply}
                  disabled={!dateRange?.from || !dateRange?.to}
                  className="w-full"
                >
                  Alkalmaz
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 md:mb-8">
        {/* New Leads */}
        <Card className="border-ring/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">{t.newLeads}</CardTitle>
            <UserRoundPlus className="h-6 w-6" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-lg">
              <div className="flex items-center justify-between">
                <span>DevOps</span>
                <span>{stats.newLeads.devops}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Üzemeltetés</span>
                <span>{stats.newLeads.uzemeltetes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fejlesztés</span>
                <span>{stats.newLeads.fejlesztes}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offers */}
        <Card className="border-ring/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">{t.offers}</CardTitle>
            <FileBadge className="h-6 w-6" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-lg">
              <div className="flex items-center justify-between">
                <span>{t.sent}</span>
                <span>{stats.offers.sent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t.awaitingOffer}</span>
                <span>{stats.offers.awaiting}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deadlines */}
        <Card className="border-ring/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">{t.deadlines}</CardTitle>
            <ClipboardClock className="h-6 w-6" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-lg">
              <div className="flex items-center justify-between">
                <span>{t.upcoming}</span>
                <span>{stats.deadlines.upcoming}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn(stats.deadlines.overdue > 0 ? 'text-destructive' : '')}>
                  {t.overdue}
                </span>
                <span className={cn(stats.deadlines.overdue > 0 ? 'text-destructive' : '')}>
                  {stats.deadlines.overdue}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Tasks */}
        <Card className="border-ring/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">{t.tasks}</CardTitle>
            <CircleCheckBig className="h-6 w-6" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-lg">
              <div className="flex items-center justify-between">
                <span>{t.new}</span>
                <span>{stats.taskStats.new}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t.inProgress}</span>
                <span>{stats.taskStats.inProgress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t.closed}</span>
                <span>{stats.taskStats.closed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t.delayed}</span>
                <span>{stats.taskStats.delayed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Section */}
        <Card className="border-ring/30 min-h-[210px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">{t.events}</CardTitle>
            <div className="flex flex-row gap-2">
              <div
                onClick={() => eventsPage > 0 && setEventsPage((prev) => prev - 1)}
                className={`cursor-pointer transition-opacity ${
                  eventsPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-70'
                }`}
              >
                <ChevronLeft className="h-6 w-6" />
              </div>
              <div
                onClick={() => eventsPage < totalPages - 1 && setEventsPage((prev) => prev + 1)}
                className={`cursor-pointer transition-opacity ${
                  eventsPage >= totalPages - 1
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:opacity-70'
                }`}
              >
                <ChevronRight className="h-6 w-6" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-lg">
              {events.length === 0 ? (
                <p className="text-xl text-center py-4">{t.noEvents}</p>
              ) : (
                paginatedEvents.map((event) => {
                  const isMeeting = event.type === 'meeting'
                  const mainColor = isMeeting ? 'text-chart-4' : 'text-chart-5'
                  const startTime = isMeeting
                    ? event.startTime
                      ? new Date(event.startTime)
                      : null
                    : event.notifyAt
                      ? new Date(event.notifyAt)
                      : null

                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() =>
                        (window.top!.location.href = `/admin/collections/events/${event.id}`)
                      }
                    >
                      <div className="flex items-center gap-3 font-medium">
                        {isMeeting ? (
                          <Presentation size={16} className={mainColor} />
                        ) : (
                          <BellDot size={16} className={mainColor} />
                        )}
                        <span className={mainColor}>{event.title}</span>
                      </div>
                      {startTime && (
                        <span className={cn('font-medium', mainColor)}>
                          {format(startTime, 'MM.dd. HH:mm', { locale: hu })}
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
