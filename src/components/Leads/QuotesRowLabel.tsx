'use client'

import React, { useMemo } from 'react'
import { useTranslation, useRowLabel } from '@payloadcms/ui'
import { quoteTypeOptions } from '@/lib/locale/select-translations'

export const QuotesRowLabel = () => {
  const { i18n } = useTranslation()
  const locale = i18n?.language?.toLowerCase().startsWith('hu') ? 'hu' : 'en'
  const { data } = useRowLabel<{ sentAt?: string; type?: string }>()

  const sentAtLabel = useMemo(() => {
    if (!data?.sentAt) return undefined
    return new Date(data.sentAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }, [data?.sentAt])

  const typeLabel = useMemo(() => {
    if (!data?.type) return undefined
    const option = quoteTypeOptions.find((opt) => opt.value === data.type)
    if (!option) return undefined
    if (typeof option.label === 'object' && option.label !== null) {
      return option.label[locale] ?? option.label.en ?? option.label.hu
    }
    return option.label
  }, [data?.type, locale])

  if (!sentAtLabel) return <></>

  const labelWithType = typeLabel ? `${sentAtLabel} - ${typeLabel}` : sentAtLabel

  return <label>{labelWithType}</label>
}

export default QuotesRowLabel
