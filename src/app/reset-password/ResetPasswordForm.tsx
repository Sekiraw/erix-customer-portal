'use client'

import React, { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { resetPasswordAction, type ResetPasswordState } from './actions'
import PasswordStrengthBar, { getStrength } from '@/components/PasswordStrengthBar'

type Lang = 'en' | 'hu'

const labels = {
  password: { en: 'New password', hu: 'Új jelszó' },
  confirm: { en: 'Confirm password', hu: 'Jelszó megerősítése' },
  submit: { en: 'Set new password', hu: 'Jelszó beállítása' },
  submitPending: { en: 'Saving...', hu: 'Mentés...' },
  rules: {
    en: 'At least 8 characters, one uppercase letter, one lowercase letter, one number, one special character.',
    hu: 'Legalább 8 karakter, egy nagybetű, egy kisbetű, egy szám, egy speciális karakter.',
  },
}

function SubmitButton({ label, pendingLabel, disabled }: { label: string; pendingLabel: string; disabled?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex w-full hover:cursor-pointer items-center justify-center px-4 py-3 rounded-md bg-chart-3 text-white font-semibold border border-chart-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-chart-3/90"
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

export default function ResetPasswordForm({ lang, token }: { lang: Lang; token: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, {} as ResetPasswordState)
  const [password, setPassword] = useState('')
  const strength = getStrength(password)

  return (
    <form action={formAction} className="flex flex-col gap-6 w-full">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-2">
        <label className="text-base text-black" htmlFor="password">
          {labels.password[lang]}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 text-base text-black w-full px-3 rounded-md border border-border bg-input"
        />

        {password.length > 0 && (
          <PasswordStrengthBar strength={strength} lang={lang} />
        )}

        <p className="text-xs text-black/50">{labels.rules[lang]}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-base text-black" htmlFor="confirm">
          {labels.confirm[lang]}
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          className="h-12 text-base text-black w-full px-3 rounded-md border border-border bg-input"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton label={labels.submit[lang]} pendingLabel={labels.submitPending[lang]} disabled={strength < 5} />
    </form>
  )
}
