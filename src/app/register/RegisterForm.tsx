'use client'

import React, { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { registerAction, type RegisterState } from './actions'
import PasswordStrengthBar, { getStrength, passwordRules } from '@/components/PasswordStrengthBar'

const initialState: RegisterState = {}

type Lang = 'en' | 'hu'

const labels = {
  firstName: { en: 'First Name', hu: 'Keresztnév' },
  lastName: { en: 'Last Name', hu: 'Vezetéknév' },
  email: { en: 'Email', hu: 'E-mail' },
  password: { en: 'Password', hu: 'Jelszó' },
  confirmPassword: { en: 'Confirm Password', hu: 'Jelszó megerősítése' },
  submit: { en: 'Register', hu: 'Regisztráció' },
  submitPending: { en: 'Registering...', hu: 'Regisztráció...' },
  terms: {
    en: 'I have read and accept the Terms and Conditions.',
    hu: 'Elolvastam és elfogadom az Általános Szerződési Feltételeket.',
  },
  passwordRequirementsTitle: {
    en: 'Password requirements:',
    hu: 'Jelszó követelmények:',
  },
} as const


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

export default function RegisterForm({ lang }: { lang: Lang }) {

  const [state, formAction] = useActionState(registerAction, initialState)
  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const strength = getStrength(password)

  const inputClass =
    'h-12 text-base text-black w-full px-3 rounded-md border border-border bg-input'

  return (
    <form action={formAction} className="flex flex-col gap-6 w-full">
      <input type="hidden" name="locale" value={lang} />

      {/* Name row */}
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
            className={inputClass}
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
            className={inputClass}
          />
        </div>
      </div>

      {/* Email */}
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
          className={inputClass}
        />
      </div>

      {/* Password */}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordTouched(true)}
          className={inputClass}
        />
        {password.length > 0 && (
          <PasswordStrengthBar strength={strength} lang={lang} />
        )}
        {/* Live password requirements */}
        {(passwordTouched || password.length > 0) && (
          <ul className="mt-1 flex flex-col gap-1">
            <li className="text-xs text-black/60">{labels.passwordRequirementsTitle[lang]}</li>
            {passwordRules.map((rule) => {
              const met = rule.test(password)
              return (
                <li
                  key={rule.key}
                  className={`text-xs flex items-center gap-1.5 ${met ? 'text-green-600' : 'text-red-500'}`}
                >
                  <span>{met ? '✓' : '✗'}</span>
                  {rule.label[lang]}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Confirm password */}
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
          className={inputClass}
        />
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start gap-3">
        <input
          id="termsAccepted"
          name="termsAccepted"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-chart-3 cursor-pointer"
        />
        <label htmlFor="termsAccepted" className="text-sm text-black cursor-pointer leading-snug">
          {labels.terms[lang]}
        </label>
      </div>

      {/* Server-side error */}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex w-full">
        <SubmitButton label={labels.submit[lang]} pendingLabel={labels.submitPending[lang]} disabled={strength < 5} />
      </div>
    </form>
  )
}
