'use client'

import React, { useMemo } from 'react'
import { useTranslation, useRowLabel } from '@payloadcms/ui'

const NotesRowLabel = () => {
  const { i18n } = useTranslation()
  const locale = i18n?.language?.toLowerCase().startsWith('hu') ? 'hu' : 'en'
  const { data } = useRowLabel<{ createdAt?: string }>()

  const createdAtLabel = useMemo(() => {
    if (!data?.createdAt) return undefined
    return new Date(data.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }, [data?.createdAt])

  if (!createdAtLabel) return <></>

  return <label>{createdAtLabel}</label>
}

export default NotesRowLabel
