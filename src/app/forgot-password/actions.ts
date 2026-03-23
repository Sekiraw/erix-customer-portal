'use server'

import crypto from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendPasswordResetEmail } from '@/lib/email/service'

export type ForgotPasswordState = {
  success?: boolean
  error?: string
}

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = (formData.get('email') as string | null)?.trim().toLowerCase() ?? ''

  if (!email) return { error: 'Az e-mail cím megadása kötelező.' }

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })

  // Always return success to avoid user enumeration
  if (docs.length === 0) return { success: true }

  const user = docs[0]!

  // Rate limit: allow at most one reset request per email per 5 minutes
  const lastRequest = user.lastPasswordResetRequestAt
    ? new Date(user.lastPasswordResetRequestAt as string)
    : null
  if (lastRequest && Date.now() - lastRequest.getTime() < 5 * 60 * 1000) {
    return { success: true }
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      resetPasswordToken: token,
      resetPasswordTokenExpiresAt: expiresAt.toISOString(),
      // Also set Payload's internal expiry field so payload.resetPassword() validates correctly
      resetPasswordExpiration: expiresAt.toISOString(),
      lastPasswordResetRequestAt: new Date().toISOString(),
    } as never,
    overrideAccess: true,
  })

  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  await sendPasswordResetEmail(
    { firstName: user.firstName, lastName: user.lastName, email: user.email },
    resetUrl,
  )

  return { success: true }
}
