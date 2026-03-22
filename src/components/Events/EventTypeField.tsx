'use client'

import { FieldLabel, useField, useTranslation } from '@payloadcms/ui'
import { BellIcon, Presentation } from 'lucide-react'
import React from 'react'

const ICONS: Record<string, React.ReactNode> = {
  notification: <BellIcon className="ml-1" size={18} />,
  meeting: <Presentation className="ml-1" size={18} />,
}

const ACTIVE_COLORS: Record<string, string> = {
  meeting: 'chart-4',
  notification: 'chart-5',
}

const EventTypeField: React.FC<any> = (props) => {
  const { path } = props
  const { value, setValue } = useField<string>({ path })
  const { i18n } = useTranslation()
  const lang = i18n.language ?? 'en'

  const options: { value: string; label: Record<string, string> | string }[] =
    props.field?.options ?? []

  const current = value ?? 'meeting'

  return (
    <div className="mb-6">
      <FieldLabel {...props} label={props.field.label} />

      <div className="flex w-full gap-2 mt-2">
        {options.map((opt) => {
          const isActive = current === opt.value
          const activeColor = ACTIVE_COLORS[opt.value] ?? 'chart-3'
          const label =
            typeof opt.label === 'object'
              ? (opt.label[lang] ?? opt.label['en'] ?? opt.value)
              : opt.label
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue(opt.value)}
              className={[
                'flex items-center text-lg w-full gap-2 px-2 h-13 rounded-md border transition-all cursor-pointer',
                isActive
                  ? `border-${activeColor} bg-transparent text-${activeColor} font-semibold`
                  : 'border-border bg-transparent text-foreground font-normal hover:border-chart-3/50 hover:text-chart-3/80',
              ].join(' ')}
            >
              {ICONS[opt.value]}
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default EventTypeField
