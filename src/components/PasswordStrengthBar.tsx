'use client'

import React from 'react'

type Lang = 'en' | 'hu'

export const passwordRules = [
  {
    key: 'min8',
    test: (p: string) => p.length >= 8,
    label: { en: 'At least 8 characters', hu: 'Legalább 8 karakter' },
  },
  {
    key: 'uppercase',
    test: (p: string) => /[A-Z]/.test(p),
    label: { en: 'At least one uppercase letter', hu: 'Legalább egy nagybetű' },
  },
  {
    key: 'lowercase',
    test: (p: string) => /[a-z]/.test(p),
    label: { en: 'At least one lowercase letter', hu: 'Legalább egy kisbetű' },
  },
  {
    key: 'number',
    test: (p: string) => /[0-9]/.test(p),
    label: { en: 'At least one number', hu: 'Legalább egy szám' },
  },
  {
    key: 'special',
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
    label: { en: 'At least one special character', hu: 'Legalább egy speciális karakter' },
  },
] as const

export function getStrength(pw: string): 0 | 1 | 2 | 3 | 4 | 5 {
  return passwordRules.filter((r) => r.test(pw)).length as 0 | 1 | 2 | 3 | 4 | 5
}

const strengthColors = [
  'bg-gray-200',   // 0 – unused (all segments gray when score=0)
  'bg-red-400',    // 1 – very weak
  'bg-orange-400', // 2 – weak
  'bg-yellow-400', // 3 – fair
  'bg-lime-400',   // 4 – good
  'bg-green-500',  // 5 – strong
]

const strengthLabels: Record<Lang, string[]> = {
  en: ['', 'Very weak', 'Weak', 'Fair', 'Good', 'Strong'],
  hu: ['', 'Nagyon gyenge', 'Gyenge', 'Közepes', 'Jó', 'Erős'],
}

export default function PasswordStrengthBar({
  strength,
  lang,
}: {
  strength: 0 | 1 | 2 | 3 | 4 | 5
  lang: Lang
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors ${
              i <= strength ? strengthColors[strength] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {strength > 0 && (
        <span className="text-xs text-black/60">{strengthLabels[lang][strength]}</span>
      )}
    </div>
  )
}
