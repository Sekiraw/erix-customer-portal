'use client'

import { FieldLabel, TextInput, useField, useTranslation } from '@payloadcms/ui'
import { ExternalLink } from 'lucide-react'
import React from 'react'

const PLATFORM_LABELS: Record<string, string> = {
  zoom: 'Zoom',
  google_meet: 'Google Meet',
  teams: 'Microsoft Teams',
  other: 'Egyéb',
}

const MeetingLinkField: React.FC<any> = (props) => {
  const { path } = props
  const { i18n } = useTranslation()
  const lang = i18n.language ?? 'en'

  const { value, setValue } = useField<string>({ path })
  const platformPath = path.replace('meetingLink', 'platform')
  const { value: platform, setValue: setPlatform } = useField<string>({ path: platformPath })

  const toExternalUrl = (raw?: string) => {
    const trimmed = (raw ?? '').trim()
    if (!trimmed) return null
    return /^[a-zA-Z][\w+.-]*:/.test(trimmed) ? trimmed : `https://${trimmed}`
  }

  const handleChange = (val: string) => {
    setValue(val)

    if (!val) {
      setPlatform(undefined)
      return
    }

    const link = val.toLowerCase()

    if (link.includes('zoom.us')) {
      setPlatform('zoom')
    } else if (link.includes('meet.google.com')) {
      setPlatform('google_meet')
    } else if (link.includes('teams.microsoft.com') || link.includes('teams.live.com')) {
      setPlatform('teams')
    } else {
      setPlatform('other')
    }
  }

  const handleJoin = () => {
    const external = toExternalUrl(value)
    if (!external) return
    window.open(external, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="mb-6">
      <FieldLabel {...props} label={props.field.label} />

      <div className="flex items-center gap-2">
        <TextInput
          {...props}
          className="flex-1"
          value={value || ''}
          onChange={(e: { target: { value: string } }) => handleChange(e.target.value)}
        />

        {value && (
          <button
            type="button"
            onClick={handleJoin}
            disabled={!value}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-md bg-chart-3 text-white font-semibold border border-chart-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-chart-3/90 hover:cursor-pointer"
          >
            {lang === 'hu' ? 'Csatlakozás' : 'Join'}
            <ExternalLink size={16} />
          </button>
        )}
      </div>

      {platform && (
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-ring/60 leading-5">
            Platform: {PLATFORM_LABELS[platform] ?? platform}
          </span>
        </div>
      )}
    </div>
  )
}

export default MeetingLinkField
