import { describe, it, expect } from 'vitest'
import { getStrength, passwordRules } from '@/components/PasswordStrengthBar'

describe('passwordRules', () => {
  it('exports exactly 5 rules', () => {
    expect(passwordRules).toHaveLength(5)
  })

  it('min8: passes for 8+ characters, fails below', () => {
    const r = passwordRules.find((x) => x.key === 'min8')!
    expect(r.test('abcdefgh')).toBe(true)
    expect(r.test('abcdefg')).toBe(false)
  })

  it('uppercase: passes when uppercase present', () => {
    const r = passwordRules.find((x) => x.key === 'uppercase')!
    expect(r.test('A')).toBe(true)
    expect(r.test('abc')).toBe(false)
  })

  it('lowercase: passes when lowercase present', () => {
    const r = passwordRules.find((x) => x.key === 'lowercase')!
    expect(r.test('a')).toBe(true)
    expect(r.test('ABC')).toBe(false)
  })

  it('number: passes when digit present', () => {
    const r = passwordRules.find((x) => x.key === 'number')!
    expect(r.test('1')).toBe(true)
    expect(r.test('abc')).toBe(false)
  })

  it('special: passes for non-alphanumeric (including space)', () => {
    const r = passwordRules.find((x) => x.key === 'special')!
    expect(r.test('!')).toBe(true)
    expect(r.test(' ')).toBe(true)
    expect(r.test('abc123')).toBe(false)
  })
})

describe('getStrength', () => {
  it('returns 0 for empty string', () => {
    expect(getStrength('')).toBe(0)
  })

  it('returns 1 when only lowercase met', () => {
    expect(getStrength('abc')).toBe(1)
  })

  it('returns 2 when uppercase + lowercase met', () => {
    expect(getStrength('Abc')).toBe(2)
  })

  it('returns 3 when uppercase + lowercase + number met', () => {
    expect(getStrength('Abc1')).toBe(3)
  })

  it('returns 4 when all rules except min8 met', () => {
    expect(getStrength('Abc1!')).toBe(4)
  })

  it('returns 5 when all rules met', () => {
    expect(getStrength('Abc12345!')).toBe(5)
  })
})
