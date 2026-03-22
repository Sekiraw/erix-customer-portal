'use client'

import { DatePicker, FieldLabel, useField, useTranslation } from '@payloadcms/ui'
import { format } from 'date-fns'
import { enUS, hu } from 'date-fns/locale'
import React, { forwardRef, useEffect, useMemo, useState } from 'react'

function toDateValue(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

function toTimeValue(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  } catch {
    return ''
  }
}

function buildISO(date: string, time: string): string | undefined {
  if (!date) return undefined
  const t = time || '00:00'
  const [year, month, day] = date.split('-').map(Number)
  const [hh, mm] = t.split(':').map(Number)
  return new Date(year, month - 1, day, hh, mm).toISOString()
}

function toLocalDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined
  try {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  } catch {
    return undefined
  }
}

function formatDateDisplay(dateStr: string, lang: string): string {
  try {
    const dateLocale = lang === 'hu' ? hu : enUS
    const d = toLocalDate(dateStr)!
    const formatted = format(d, 'EEEE, MMMM d.', { locale: dateLocale })
    // Capitalize day name and month name
    return formatted
      .split(', ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(', ')
  } catch {
    return dateStr
  }
}

// Custom input for the DatePicker — receives dateISO/lang as own props,
// and onClick/ref injected by react-datepicker via React.cloneElement
const DateDisplayInput = forwardRef<HTMLButtonElement, any>(
  ({ onClick, dateISO, lang, placeholder }, ref) => {
    const label = dateISO ? formatDateDisplay(dateISO, lang) : placeholder
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={[
          'h-13 px-3.5 pr-12 rounded-md border border-border text-md cursor-pointer whitespace-nowrap min-w-[180px] transition-colors text-left flex items-center bg-transparent',
          dateISO ? 'text-foreground' : 'text-muted-foreground',
        ].join(' ')}
      >
        {label}
      </button>
    )
  },
)
DateDisplayInput.displayName = 'DateDisplayInput'

const EventDateRangeField: React.FC<any> = (props) => {
  const { path } = props

  const { value: startISO, setValue: setStart } = useField<string>({ path })
  const endPath = path.replace('startTime', 'endTime')
  const { value: endISO, setValue: setEnd } = useField<string>({ path: endPath })

  const { i18n } = useTranslation()
  const lang = i18n.language ?? 'en'
  const dateLocale = lang === 'hu' ? hu : enUS
  const placeholder = lang === 'hu' ? 'Dátum kiválasztása' : 'Select date'

  const [date, setDate] = useState<string>(toDateValue(startISO))
  const [startTime, setStartTime] = useState<string>(toTimeValue(startISO))
  const [endTime, setEndTime] = useState<string>(toTimeValue(endISO))

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URL(window.location.href).searchParams
    const startTimeFromURL = params.get('startTime')
    if (!startTimeFromURL) return

    const timer = setTimeout(() => {
      const startDateObj = new Date(startTimeFromURL)
      const endDateObj = new Date(startDateObj.getTime() + 60 * 60 * 1000)
      const endISOFromURL = endDateObj.toISOString()

      setDate(toDateValue(startTimeFromURL))
      setStartTime(toTimeValue(startTimeFromURL))
      setStart(startTimeFromURL)
      setEndTime(toTimeValue(endISOFromURL))
      setEnd(endISOFromURL)
    }, 50)

    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (startISO) {
      setDate(toDateValue(startISO))
      setStartTime(toTimeValue(startISO))
    }
  }, [startISO])

  useEffect(() => {
    if (endISO) {
      setEndTime(toTimeValue(endISO))
    }
  }, [endISO])

  const handleDateChange = (newDate: Date) => {
    const iso = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`
    setDate(iso)
    setStart(buildISO(iso, startTime))
    setEnd(buildISO(iso, endTime))
  }

  const handleStartTimeChange = (newTime: string) => {
    setStartTime(newTime)
    setStart(buildISO(date, newTime))
  }

  const handleEndTimeChange = (newTime: string) => {
    setEndTime(newTime)
    setEnd(buildISO(date, newTime))
  }

  const customInput = useMemo(
    () => <DateDisplayInput dateISO={date} lang={lang} placeholder={placeholder} />,
    [date, lang, placeholder],
  )

  return (
    <div className="mb-6">
      <FieldLabel {...props} label={props.field?.label ?? { en: 'Date / Time', hu: 'Időpont' }} />

      <div className="flex items-center gap-2.5 flex-wrap mt-1 text-black">
        <div className="event-date-picker">
          <DatePicker
            value={toLocalDate(date)}
            onChange={handleDateChange}
            pickerAppearance="dayOnly"
            overrides={{
              locale: dateLocale,
              customInput,
            }}
          />
        </div>

        {/* Start time */}
        <input
          type="time"
          value={startTime}
          onChange={(e) => handleStartTimeChange(e.target.value)}
          className="h-13 px-2.5 rounded-md border border-border text-md text-foreground cursor-pointer time-input"
        />

        <span className="text-muted-foreground text-md">-</span>

        {/* End time */}
        <input
          type="time"
          value={endTime}
          onChange={(e) => handleEndTimeChange(e.target.value)}
          className="h-13 px-2.5 rounded-md border border-border text-md text-foreground cursor-pointer time-input"
        />
      </div>
    </div>
  )
}

export default EventDateRangeField
