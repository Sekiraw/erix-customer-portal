'use client'

import React from 'react'
import { useListQuery, useTranslation } from '@payloadcms/ui'
import { AdminPaginator } from './AdminPaginator'

export default function AdminListPaginationClient() {
  const { data, defaultLimit, handlePageChange, handlePerPageChange, query } = useListQuery()
  const { i18n } = useTranslation()

  const page = data?.page ?? query.page ?? 1
  const pageSize =
    data?.limit ??
    (typeof query.limit === 'number'
      ? query.limit
      : typeof defaultLimit === 'number'
        ? defaultLimit
        : 10)

  const totalDocs = data?.totalDocs ?? 0
  const totalPages = data?.totalPages ?? 1
  const pagingCounter = data?.pagingCounter

  if (!data) return null

  const language = i18n.language

  const labels =
    language === 'hu'
      ? {
          pageLabel: 'Oldal',
          ofLabel: 'a',
          perPageLabel: 'Oldalanként',
        }
      : {
          pageLabel: 'Page',
          ofLabel: 'of',
          perPageLabel: 'Per page',
        }

  return (
    <AdminPaginator
      page={page}
      totalPages={totalPages}
      pageSize={pageSize}
      totalDocs={totalDocs}
      pagingCounter={pagingCounter}
      labels={labels}
      onPageChange={(p) => {
        void handlePageChange?.(p)
      }}
      onPageSizeChange={(nextLimit) => {
        void handlePerPageChange?.(nextLimit)
      }}
    />
  )
}
