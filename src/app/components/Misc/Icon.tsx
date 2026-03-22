'use client'

import React from 'react'
import Image from 'next/image'

import { useAppIcon } from './useAppIcon'

export const Icon = () => {
  const { src, alt } = useAppIcon()

  return <Image width={200} className="rounded-md" height={200} src={src} alt={alt} />
}

export default Icon
