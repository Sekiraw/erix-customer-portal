'use client'

import React, { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useTranslation } from '@payloadcms/ui'
import { createFirstUserAction, type CreateFirstUserState } from './actions'

const initialState: CreateFirstUserState = {}

const labels = {
  firstName: { en: 'First Name', hu: 'Keresztnév' },
  lastName: { en: 'Last Name', hu: 'Vezetéknév' },
  email: { en: 'Email', hu: 'E-mail' },
  password: { en: 'Password', hu: 'Jelszó' },
  confirmPassword: { en: 'Confirm Password', hu: 'Jelszó megerősítése' },
  submit: { en: 'Create user', hu: 'Létrehozás' },
  submitPending: { en: 'Creating...', hu: 'Létrehozás...' },
  requiredError: { en: 'All fields are required.', hu: 'Minden mező kötelező.' },
  mismatchError: { en: 'Passwords must match.', hu: 'A jelszavaknak egyezniük kell.' },
  genericError: {
    en: 'Failed to create user. Please try again.',
    hu: 'Nem sikerült létrehozni a felhasználót. Próbáld újra.',
  },
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full hover:cursor-pointer items-center justify-center px-4 py-3 rounded-md bg-chart-3 text-white font-semibold border border-chart-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-chart-3/90"
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

export default function CreateFirstUserForm() {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'en' ? 'en' : 'hu'

  const [state, formAction] = useActionState(createFirstUserAction, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-6 w-full">
      <input type="hidden" name="locale" value={lang} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-base text-black" htmlFor="lastName">
            {labels.lastName[lang]}
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            autoComplete="family-name"
            className="h-12 text-base text-black w-full px-3 rounded-md border border-border bg-input"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-base text-black" htmlFor="firstName">
            {labels.firstName[lang]}
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            autoComplete="given-name"
            className="h-12 text-base text-black w-full px-3 rounded-md border border-border bg-input"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-base text-black" htmlFor="email">
          {labels.email[lang]}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-12 text-base text-black w-full px-3 rounded-md border border-border bg-input"
        />
      </div>

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
          className="h-12 text-base text-black w-full px-3 rounded-md border border-border bg-input"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-base text-black" htmlFor="confirmPassword">
          {labels.confirmPassword[lang]}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="h-12 text-base text-black w-full px-3 rounded-md border border-border bg-input"
        />
      </div>

      {state?.error && <p className="text-sm text-error-600">{state.error}</p>}

      <div className="flex w-full">
        <SubmitButton label={labels.submit[lang]} pendingLabel={labels.submitPending[lang]} />
      </div>
    </form>
  )
}
