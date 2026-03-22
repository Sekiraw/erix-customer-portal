import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import payloadConfigPromise from '@/payload.config'
import fallbackLogo from '@/app/public/logo.png'

const FALLBACK_ICON_SRC = typeof fallbackLogo === 'string' ? fallbackLogo : fallbackLogo.src

export async function GET(request: NextRequest) {
  const fallbackUrl = new URL(FALLBACK_ICON_SRC, request.url)

  try {
    const payloadConfig = await payloadConfigPromise
    const payload = await getPayload({ config: payloadConfig })

    const appSettings = await payload.findGlobal({
      slug: 'app-settings',
      depth: 1,
      overrideAccess: true,
    })

    const branding = (appSettings as { branding?: { appIcon?: unknown } }).branding
    const appIcon = branding?.appIcon as
      | (Record<string, unknown> & { url?: string | null })
      | string
      | null
      | undefined

    let iconUrl: string | null = null

    if (
      appIcon &&
      typeof appIcon === 'object' &&
      'url' in appIcon &&
      typeof appIcon.url === 'string'
    ) {
      iconUrl = appIcon.url
    } else if (typeof appIcon === 'string' && appIcon) {
      iconUrl = `/media/${appIcon}`
    }

    if (!iconUrl) {
      return NextResponse.redirect(fallbackUrl)
    }

    return NextResponse.redirect(new URL(iconUrl, request.url))
  } catch (error) {
    console.error('[api/app-icon] Unable to resolve icon', error)
    return NextResponse.redirect(fallbackUrl)
  }
}
