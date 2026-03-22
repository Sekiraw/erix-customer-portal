'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { useAppIcon } from './useAppIcon'
import { useAppTitle } from './useAppTitle'

export const BeforeNav = () => {
  const { src, alt } = useAppIcon()
  const appTitle = useAppTitle()

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = appTitle
    }
  }, [appTitle])

  return (
    <Link href="/admin" className="mb-8" style={{ textDecoration: 'none' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <Image src={src} width={46} height={46} alt={alt || 'App icon'} className="rounded-lg" />
        <p className="font-semibold text-xl text-card-foreground">{appTitle}</p>
      </div>
    </Link>
  )
}
export default BeforeNav
