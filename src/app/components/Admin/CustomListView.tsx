import React from 'react'
import type { ListViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { AdminPaginator } from './AdminPaginator'
import { CustomListViewClient } from './CustomListViewClient'

export default async function CustomListView(props: ListViewServerProps) {
  return (
    <DefaultTemplate {...props}>
      <Gutter>
        <CustomListViewClient />
      </Gutter>
    </DefaultTemplate>
  )
}
