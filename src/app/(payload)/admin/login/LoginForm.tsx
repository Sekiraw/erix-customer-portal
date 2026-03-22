'use client'

import Image from 'next/image'
import { useEffect, useState, type FormEvent } from 'react'

import loginCtaLogo from '@/assets/login-crm.png'

type Locale = 'hu' | 'en'

const translations = {
  hu: {
    email: 'E-mail',
    password: 'Jelszó',
    forgotPassword: 'Elfelejtetted a jelszavad?',
    login: 'Bejelentkezés',
    interested: 'Érdekel?',
    connect: 'Lépjünk kapcsolatba!',
    loginFailed: 'Sikertelen bejelentkezés',
  },
  en: {
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot your password?',
    login: 'Sign in',
    interested: 'Interested?',
    connect: "Let's connect!",
    loginFailed: 'Login failed',
  },
} as const

export default function LoginForm() {
  const [locale, setLocale] = useState<Locale>('hu')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const t = translations[locale]

  useEffect(() => {
    const browserLocale =
      typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('en')
        ? 'en'
        : 'hu'
    setLocale(browserLocale)
  }, [])

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      window.location.href = '/admin'
    } else {
      setError(t.loginFailed)
    }
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-4 py-8">
      <div className="absolute inset-0" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[420px] items-center">
        <form
          onSubmit={handleLogin}
          className="w-full rounded-2xl bg-card/85 p-10 text-foreground shadow-sm backdrop-blur-[3px]"
        >
          <div className="mb-5">
            <label htmlFor="email" className="mb-2 block text-black text-lg">
              {t.email}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="h-16 w-full rounded-sm border border-black/30 bg-background px-3 text-black text-xl"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-black text-lg">
              {t.password}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="h-16 w-full rounded-sm border border-black/30 bg-background px-3 text-black text-xl"
            />
          </div>

          <div className="mb-6 text-right">
            <a href="#" className="text-md text-black underline underline-offset-2">
              {t.forgotPassword}
            </a>
          </div>

          <button
            type="submit"
            className="h-16 w-full rounded-md bg-chart-3 text-xl border-none font-semibold text-primary-foreground transition-opacity hover:opacity-95"
          >
            {t.login}
          </button>

          {error && (
            <div className="w-full mt-4">
              <p className="mt-2 text-error-600">{error}</p>
            </div>
          )}

          <div className="flex items-end justify-between gap-4 mt-16">
            <Image src={loginCtaLogo} alt="CRM by Whizystems" priority className="h-auto w-32" />

            <p className="text-right text-xl text-black">
              {t.interested}
              <br />
              <a href="#" className="font-semibold text-chart-3 underline underline-offset-2">
                {t.connect}
              </a>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}
