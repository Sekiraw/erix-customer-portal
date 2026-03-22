'use client'

import React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { AdminPaginator } from './AdminPaginator'

export function CustomListViewClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const page = Number(searchParams.get('page') || '1')
  const limit = Number(searchParams.get('limit') || '10')

  // Basic, placeholder values until we wire into Payload's list meta
  const totalDocs = 0
  const totalPages = page // prevents 0 while keeping UI simple

  const updateSearchParams = (nextPage: number, nextLimit = limit) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(nextPage))
    params.set('limit', String(nextLimit))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <AdminPaginator
      page={page}
      totalPages={totalPages}
      pageSize={limit}
      totalDocs={totalDocs}
      onPageChange={(p) => updateSearchParams(p)}
      onPageSizeChange={(nextLimit) => updateSearchParams(1, nextLimit)}
    />
  )
}
