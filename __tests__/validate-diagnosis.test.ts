import { describe, it, expect } from 'vitest'
import { validateDiagnosis } from '../lib/validate-diagnosis'
import { WEAKNESS_KEYS } from '../lib/types'

function makeValidWeaknesses(overrides: Record<string, unknown> = {}) {
  const base: Record<string, unknown> = {}
  for (const key of WEAKNESS_KEYS) {
    base[key] = { flagged: false }
  }
  return { ...base, ...overrides }
}

const validResponse = {
  isJobAd: true,
  isLegal: true,
  weaknesses: makeValidWeaknesses(),
}

describe('validateDiagnosis', () => {
  it('passes a valid full response', () => {
    expect(() => validateDiagnosis(validResponse)).not.toThrow()
  })

  it('passes when isJobAd is false (shape still valid)', () => {
    expect(() =>
      validateDiagnosis({ isJobAd: false, isLegal: true, weaknesses: makeValidWeaknesses() })
    ).not.toThrow()
  })

  it('throws when weaknesses key is missing', () => {
    expect(() => validateDiagnosis({ isJobAd: true, isLegal: true })).toThrow()
  })

  it('throws when any of the 8 weakness keys is missing', () => {
    const w = makeValidWeaknesses()
    delete (w as Record<string, unknown>)['bias_risks']
    expect(() => validateDiagnosis({ isJobAd: true, isLegal: true, weaknesses: w })).toThrow()
  })

  it('throws when flagged:true has no explanation', () => {
    const w = makeValidWeaknesses({
      bias_risks: { flagged: true, fix: 'Try: something' },
    })
    expect(() => validateDiagnosis({ isJobAd: true, isLegal: true, weaknesses: w })).toThrow()
  })

  it('silently accepts flagged:false with extra explanation field', () => {
    const w = makeValidWeaknesses({
      bias_risks: { flagged: false, explanation: 'extra' },
    })
    expect(() => validateDiagnosis({ isJobAd: true, isLegal: true, weaknesses: w })).not.toThrow()
  })

  it('throws when flagged is not a boolean', () => {
    const w = makeValidWeaknesses({ bias_risks: { flagged: 'yes' } })
    expect(() => validateDiagnosis({ isJobAd: true, isLegal: true, weaknesses: w })).toThrow()
  })
})
