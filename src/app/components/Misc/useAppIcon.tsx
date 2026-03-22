'use client'

import { useEffect, useMemo, useState } from 'react'

import fallbackLogo from '../../public/logo.png'

const FALLBACK_SRC = typeof fallbackLogo === 'string' ? fallbackLogo : fallbackLogo.src
const FALLBACK_ALT = 'Whizystems Logo'
export const APP_ICON_CACHE_KEY = 'appIconCache'

type UploadDoc = {
  url?: string | null
  alt?: string | null
  sizes?: Record<string, { url?: string | null } | undefined>
}

type BrandingPayload = {
  branding?: {
    appIcon?: UploadDoc | string | null
  }
}

type IconState = {
  src: string
  alt: string
  isLoading: boolean
}

type CachedIcon = {
  src: string
  alt: string
  cachedAt: number
}

declare global {
  interface Window {
    __appIconFetchPromise?: Promise<BrandingPayload>
  }
}

const resolveIconFromPayload = (payload?: BrandingPayload): { src: string; alt: string } => {
  const appIcon = payload?.branding?.appIcon

  if (appIcon && typeof appIcon === 'object') {
    const iconDoc = appIcon as UploadDoc
    const prioritizedUrl = iconDoc.url || iconDoc.sizes?.icon?.url || iconDoc.sizes?.thumbnail?.url

    if (prioritizedUrl) {
      return {
        src: prioritizedUrl,
        alt: iconDoc.alt || 'App icon',
      }
    }
  }

  if (typeof appIcon === 'string' && appIcon) {
    return {
      src: `/media/${appIcon}`,
      alt: 'App icon',
    }
  }

  return {
    src: FALLBACK_SRC,
    alt: FALLBACK_ALT,
  }
}

export const useAppIcon = (): IconState => {
  const [state, setState] = useState<IconState>({
    src: FALLBACK_SRC,
    alt: FALLBACK_ALT,
    isLoading: true,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    let cancelled = false

    const applyCacheIfAvailable = () => {
      const cachedRaw = window.localStorage.getItem(APP_ICON_CACHE_KEY)
      if (!cachedRaw) return false

      try {
        const cached = JSON.parse(cachedRaw) as CachedIcon
        if (cached?.src) {
          setState({ src: cached.src, alt: cached.alt || FALLBACK_ALT, isLoading: false })
          return true
        }

        window.localStorage.removeItem(APP_ICON_CACHE_KEY)
        return false
      } catch {
        window.localStorage.removeItem(APP_ICON_CACHE_KEY)
        return false
      }
    }

    const hadCache = applyCacheIfAvailable()

    const fetchIcon = async () => {
      try {
        if (!window.__appIconFetchPromise) {
          window.__appIconFetchPromise = fetch('/api/globals/app-settings?depth=1', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error('Failed to load app icon')
              }
              return response.json() as Promise<BrandingPayload>
            })
            .finally(() => {
              window.__appIconFetchPromise = undefined
            })
        }

        const data = await window.__appIconFetchPromise
        const resolved = resolveIconFromPayload(data)

        if (!cancelled) {
          setState({ ...resolved, isLoading: false })
        }

        window.localStorage.setItem(
          APP_ICON_CACHE_KEY,
          JSON.stringify({ ...resolved, cachedAt: Date.now() } satisfies CachedIcon),
        )
      } catch (error) {
        console.error('[useAppIcon] Unable to load app icon', error)
        if (!cancelled && !hadCache) {
          setState({ src: FALLBACK_SRC, alt: FALLBACK_ALT, isLoading: false })
        }
      }
    }

    fetchIcon()

    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(() => state, [state])
}
