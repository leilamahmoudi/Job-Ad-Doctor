import { describe, it, expect } from 'vitest'
import { validateAnalyseInput } from '../app/api/analyse/validate'

const OVER_100_WORDS = Array(110).fill('word').join(' ')

describe('validateAnalyseInput', () => {
  it('rejects empty string', () => {
    const result = validateAnalyseInput({ jobAd: '' })
    expect(result.valid).toBe(false)
  })

  it('rejects string under 100 words', () => {
    const result = validateAnalyseInput({ jobAd: 'short text here' })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toMatch(/too short/)
  })

  it('accepts string over 100 words', () => {
    const result = validateAnalyseInput({ jobAd: OVER_100_WORDS })
    expect(result.valid).toBe(true)
  })

  it('rejects missing jobAd field', () => {
    const result = validateAnalyseInput({})
    expect(result.valid).toBe(false)
  })

  it('rejects non-string jobAd', () => {
    const result = validateAnalyseInput({ jobAd: 42 })
    expect(result.valid).toBe(false)
  })

  it('accepts optional companyName', () => {
    const result = validateAnalyseInput({ jobAd: OVER_100_WORDS, companyName: 'Acme' })
    expect(result.valid).toBe(true)
    if (result.valid) expect(result.companyName).toBe('Acme')
  })

  it('accepts optional companyDesc', () => {
    const result = validateAnalyseInput({ jobAd: OVER_100_WORDS, companyDesc: 'We build things' })
    expect(result.valid).toBe(true)
    if (result.valid) expect(result.companyDesc).toBe('We build things')
  })
})
