'use client'

import { useEffect, useMemo, useState } from 'react'

const FALLBACK_TITLE = 'CRM Portál'
export const APP_TITLE_CACHE_KEY = 'appTitleCache'
export const APP_TITLE_UPDATED_EVENT = 'app-title-updated'

type BrandingPayload = {
  branding?: {
    appTitle?: string | null
  }
}

type CachedTitle = {
  title: string
  cachedAt: number
}

declare global {
  interface Window {
    __appTitleFetchPromise?: Promise<BrandingPayload>
  }
}

const normalizeTitle = (value: unknown): string => {
  if (typeof value !== 'string') return FALLBACK_TITLE
  const trimmed = value.trim()
  return trimmed || FALLBACK_TITLE
}

const resolveTitleFromPayload = (payload?: BrandingPayload): string => {
  return normalizeTitle(payload?.branding?.appTitle)
}

export const useAppTitle = (): string => {
  const [title, setTitle] = useState<string>(FALLBACK_TITLE)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let cancelled = false

    const applyCachedTitle = () => {
      const cachedRaw = window.localStorage.getItem(APP_TITLE_CACHE_KEY)
      if (!cachedRaw) return false

      try {
        const cached = JSON.parse(cachedRaw) as CachedTitle
        const nextTitle = normalizeTitle(cached?.title)
        setTitle(nextTitle)
        return true
      } catch {
        window.localStorage.removeItem(APP_TITLE_CACHE_KEY)
        return false
      }
    }

    const hadCache = applyCachedTitle()

    const fetchTitle = async () => {
      try {
        if (!window.__appTitleFetchPromise) {
          window.__appTitleFetchPromise = fetch('/api/globals/app-settings?depth=0', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error('Failed to load app title')
              }
              return response.json() as Promise<BrandingPayload>
            })
            .finally(() => {
              window.__appTitleFetchPromise = undefined
            })
        }

        const data = await window.__appTitleFetchPromise
        const resolvedTitle = resolveTitleFromPayload(data)

        if (!cancelled) {
          setTitle(resolvedTitle)
        }

        window.localStorage.setItem(
          APP_TITLE_CACHE_KEY,
          JSON.stringify({
            title: resolvedTitle,
            cachedAt: Date.now(),
          } satisfies CachedTitle),
        )
      } catch (error) {
        console.error('[useAppTitle] Unable to load app title', error)
        if (!cancelled && !hadCache) {
          setTitle(FALLBACK_TITLE)
        }
      }
    }

    void fetchTitle()

    const onStorage = (event: StorageEvent) => {
      if (event.key !== APP_TITLE_CACHE_KEY || !event.newValue) return

      try {
        const cached = JSON.parse(event.newValue) as CachedTitle
        setTitle(normalizeTitle(cached?.title))
      } catch {
        window.localStorage.removeItem(APP_TITLE_CACHE_KEY)
      }
    }

    const onAppTitleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ title?: string }>
      const nextTitle = normalizeTitle(customEvent.detail?.title)
      setTitle(nextTitle)
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(APP_TITLE_UPDATED_EVENT, onAppTitleUpdate)

    return () => {
      cancelled = true
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(APP_TITLE_UPDATED_EVENT, onAppTitleUpdate)
    }
  }, [])

  return useMemo(() => title, [title])
}
