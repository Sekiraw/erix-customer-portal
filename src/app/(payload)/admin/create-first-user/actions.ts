'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

export type CreateFirstUserState = {
  error?: string
}

const errorMessages = {
  required: { en: 'All fields are required.', hu: 'Minden mező kötelező.' },
  mismatch: {
    en: 'Passwords must match.',
    hu: 'A jelszavaknak egyezniük kell.',
  },
  generic: {
    en: 'Failed to create user. Please try again.',
    hu: 'Nem sikerült létrehozni a felhasználót. Próbáld újra.',
  },
} as const

export async function createFirstUserAction(
  _prevState: CreateFirstUserState | void,
  formData: FormData,
): Promise<CreateFirstUserState | void> {
  const payload = await getPayload({ config })

  const { totalDocs } = await payload.count({ collection: 'users' })
  if (totalDocs > 0) {
    redirect('/admin/login')
  }

  const firstName = formData.get('firstName')?.toString().trim()
  const lastName = formData.get('lastName')?.toString().trim()
  const email = formData.get('email')?.toString().trim().toLowerCase()
  const password = formData.get('password')?.toString()
  const confirmPassword = formData.get('confirmPassword')?.toString()
  const locale = formData.get('locale')?.toString() === 'hu' ? 'hu' : 'en'

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return { error: errorMessages.required[locale] }
  }

  if (password !== confirmPassword) {
    return { error: errorMessages.mismatch[locale] }
  }

  try {
    await payload.create({
      collection: 'users',
      data: { firstName, lastName, email, password },
      overrideAccess: true,
    })

    const loginResult = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    const token = loginResult?.token
    // exp is seconds since epoch; convert to ms
    const exp = loginResult?.exp ? new Date(loginResult.exp * 1000) : undefined
    if (token) {
      ;(await cookies()).set('payload-token', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        ...(exp ? { expires: exp } : {}),
      })
    }
  } catch (err) {
    console.error('create-first-user error', err)
    return { error: errorMessages.generic[locale] }
  }

  redirect('/admin')
}
