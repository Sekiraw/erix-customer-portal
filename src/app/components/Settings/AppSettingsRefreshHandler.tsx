'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { APP_ICON_CACHE_KEY } from '@/app/components/Misc/useAppIcon'
import { APP_TITLE_CACHE_KEY } from '@/app/components/Misc/useAppTitle'

const APP_SETTINGS_PATH = '/admin/globals/app-settings'

/**
 * When on the app-settings page, intercepts successful saves of the global
 * and triggers a full page refresh so the navbar and favicon pick up new values.
 */
export function AppSettingsRefreshHandler() {
  const pathname = usePathname()
  const isOnAppSettings = pathname?.includes(APP_SETTINGS_PATH)

  useEffect(() => {
    if (!isOnAppSettings || typeof window === 'undefined') return

    const originalFetch = window.fetch
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      const response = await originalFetch.call(this, input, init)
      const url =
        typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString()
      const method = (init?.method ?? 'GET').toUpperCase()

      if (
        (method === 'POST' || method === 'PATCH' || method === 'PUT') &&
        url.includes('/api/globals/app-settings') &&
        response.ok
      ) {
        window.localStorage.removeItem(APP_ICON_CACHE_KEY)
        window.localStorage.removeItem(APP_TITLE_CACHE_KEY)
        window.location.reload()
      }

      return response
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [isOnAppSettings])

  return null
}
