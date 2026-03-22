'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useField, useTranslation } from '@payloadcms/ui'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { MessageCircleWarning } from 'lucide-react'
import type { UploadFieldClientComponent } from 'payload'

import logo from '../../public/logo.png'
import { APP_ICON_CACHE_KEY } from '../Misc/useAppIcon'
import { APP_TITLE_CACHE_KEY, APP_TITLE_UPDATED_EVENT } from '../Misc/useAppTitle'

const FALLBACK_SRC = typeof logo === 'string' ? logo : logo.src
const FALLBACK_TITLE = 'CRM Portál'

const resolvePreviewFromDoc = (doc?: Record<string, any> | null) => {
  const src =
    doc?.url ||
    doc?.sizes?.icon?.url ||
    doc?.sizes?.square?.url ||
    doc?.sizes?.thumbnail?.url ||
    FALLBACK_SRC
  return { src, alt: doc?.alt || doc?.filename || 'App icon' }
}

const extractMediaId = (value: unknown): string | null => {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    if ('value' in (value as Record<string, unknown>)) {
      const inner = (value as { value?: string | number | null }).value
      return inner != null ? String(inner) : null
    }
    if ('id' in (value as Record<string, unknown>)) {
      const id = (value as { id?: string | number | null }).id
      return id != null ? String(id) : null
    }
  }
  return null
}

const normalizeTitle = (v: unknown) => {
  if (typeof v !== 'string') return FALLBACK_TITLE
  return v.trim() || FALLBACK_TITLE
}

const AppIconField: UploadFieldClientComponent = ({ field, path }) => {
  const fieldPath = path ?? field?.name ?? ''
  const { i18n } = useTranslation()
  const locale = i18n?.language?.toLowerCase().startsWith('hu') ? 'hu' : 'en'

  /* ── Icon field ── */
  const { value, setValue } = useField<number | Record<string, unknown> | null>({ path: fieldPath })
  const [preview, setPreview] = useState(() => ({ src: FALLBACK_SRC, alt: 'App icon' }))
  const [error, setError] = useState<string | null>(null)
  const [errorOpen, setErrorOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ── Title field ── */
  const { value: rawTitle, setValue: setTitleValue } = useField<string>({
    path: 'branding.appTitle',
  })
  const titleValue = typeof rawTitle === 'string' ? rawTitle : ''

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setTitleValue(next)
    if (typeof window !== 'undefined') {
      const normalized = normalizeTitle(next)
      window.localStorage.setItem(
        APP_TITLE_CACHE_KEY,
        JSON.stringify({ title: normalized, cachedAt: Date.now() }),
      )
      window.dispatchEvent(
        new CustomEvent(APP_TITLE_UPDATED_EVENT, { detail: { title: normalized } }),
      )
      document.title = normalized
    }
  }

  /* ── Icon preview loader ── */
  useEffect(() => {
    const id = extractMediaId(value)
    if (!id) {
      setPreview({ src: FALLBACK_SRC, alt: 'App icon' })
      return
    }
    let cancelled = false
    const ctrl = new AbortController()
    fetch(`/api/media/${id}?depth=0`, {
      credentials: 'include',
      cache: 'no-store',
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setPreview(resolvePreviewFromDoc(data?.doc ?? data))
      })
      .catch(() => {
        if (!cancelled) setPreview({ src: FALLBACK_SRC, alt: 'App icon' })
      })
    return () => {
      cancelled = true
      ctrl.abort()
    }
  }, [value])

  const handleChooseFile = useCallback(() => {
    setError(null)
    setErrorOpen(false)
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      setIsUploading(true)
      setError(null)
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('alt', file.name)
        const res = await fetch('/api/media', { method: 'POST', body: fd, credentials: 'include' })
        if (!res.ok) {
          const p = await res.json().catch(() => null)
          throw new Error(p?.errors?.[0]?.message || 'Upload failed')
        }
        const data = await res.json()
        const doc = data?.doc ?? data
        if (!doc?.id) throw new Error('Upload did not return an ID')
        setValue(doc.id)
        setPreview(resolvePreviewFromDoc(doc))
        if (typeof window !== 'undefined') window.localStorage.removeItem(APP_ICON_CACHE_KEY)
      } catch (err) {
        setError(
          locale === 'hu'
            ? 'A feltöltés nem sikerült. Próbáld újra.'
            : 'Upload failed. Please try again.',
        )
        setErrorOpen(true)
      } finally {
        setIsUploading(false)
      }
    },
    [locale, setValue],
  )

  const handleRemove = useCallback(() => {
    setValue(null)
    setPreview({ src: FALLBACK_SRC, alt: 'App icon' })
    setError(null)
    setErrorOpen(false)
    if (typeof window !== 'undefined') window.localStorage.removeItem(APP_ICON_CACHE_KEY)
  }, [setValue])

  const hasValue = useMemo(() => extractMediaId(value) !== null, [value])
  const isImage = preview.src !== FALLBACK_SRC

  /* ── Labels ── */
  const t = {
    sectionTitle: locale === 'hu' ? 'Megjelenés' : 'Branding',
    sectionDesc:
      locale === 'hu'
        ? 'Logó és alkalmazás megjelenés testreszabása'
        : 'Customize logo and application appearance',
    logoLabel: locale === 'hu' ? 'Logó' : 'Logo',
    logoHint:
      locale === 'hu'
        ? 'Az itt feltöltött kép jelenik meg az alkalmazásban.'
        : 'The image uploaded here will be displayed in the application.',
    uploadBtn: isUploading
      ? locale === 'hu'
        ? 'Feltöltés...'
        : 'Uploading...'
      : locale === 'hu'
        ? 'Feltöltés'
        : 'Upload',
    removeBtn: locale === 'hu' ? 'Logó eltávolítása' : 'Remove logo',
    formats: locale === 'hu' ? 'PNG, JPG, SVG (max. 5 MB)' : 'PNG, JPG, SVG (max. 5 MB)',
    titleLabel: locale === 'hu' ? 'Alkalmazás neve' : 'Application name',
    titleHint:
      locale === 'hu'
        ? 'Ez a szöveg jelenik meg a sidebarban és a böngésző címsorában.'
        : 'This text appears in the sidebar and browser title bar.',
    titlePlaceholder: locale === 'hu' ? 'pl. CRM Portál' : 'e.g. CRM Portal',
  }

  return (
    <>
      {/* ── Settings section card ── */}
      <div className="settings-section">
        {/* Section header */}
        <div className="settings-section-header">
          <div className="settings-section-icon brand">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <div className="settings-section-title">{t.sectionTitle}</div>
            <div className="settings-section-desc">{t.sectionDesc}</div>
          </div>
        </div>

        {/* Logo form group */}
        <div className="settings-form-group">
          <div className="settings-form-label">{t.logoLabel}</div>
          <div className="settings-form-hint">{t.logoHint}</div>
          <div className="settings-logo-upload">
            <div className="settings-logo-preview">
              {isImage ? (
                <Image
                  src={preview.src}
                  alt={preview.alt}
                  width={64}
                  height={64}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <span>CRM</span>
              )}
            </div>
            <div className="settings-logo-actions">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="settings-btn-upload"
                  onClick={handleChooseFile}
                  disabled={isUploading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {t.uploadBtn}
                </button>
                {hasValue && (
                  <button
                    type="button"
                    className="settings-btn-remove"
                    onClick={handleRemove}
                    disabled={isUploading}
                  >
                    {t.removeBtn}
                  </button>
                )}
              </div>
              <div className="settings-upload-hint">{t.formats}</div>
            </div>
          </div>
        </div>

        {/* App title form group */}
        <div className="settings-form-group" style={{ marginBottom: 0 }}>
          <div className="settings-form-label">{t.titleLabel}</div>
          <div className="settings-form-hint">{t.titleHint}</div>
          <input
            type="text"
            className="settings-form-input"
            value={titleValue}
            onChange={handleTitleChange}
            placeholder={t.titlePlaceholder}
          />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Error toast */}
      <DialogPrimitive.Root open={errorOpen && Boolean(error)} onOpenChange={setErrorOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed min-w-68 bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-card border border-border px-4 py-5 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-4 data-[state=open]:slide-in-from-right-4 duration-200 focus:outline-none"
          >
            <MessageCircleWarning className="size-6 shrink-0 text-destructive" />
            <DialogPrimitive.Title className="text-xl text-foreground">
              {error}
            </DialogPrimitive.Title>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}

export default AppIconField
