'use client'

import { useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

/**
 * Keeps the branding.appTitle field registered in Payload's form context.
 * The visible UI is rendered by AppIconField alongside the logo upload.
 */
const AppTitleField: TextFieldClientComponent = ({ field, path }) => {
  useField<string>({ path: path ?? field?.name ?? '' })
  return null
}

export default AppTitleField
