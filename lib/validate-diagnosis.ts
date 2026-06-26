import { DiagnosisResult, WEAKNESS_KEYS } from './types'

export function validateDiagnosis(raw: unknown): DiagnosisResult {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Response is not an object')
  }

  const obj = raw as Record<string, unknown>

  if (typeof obj.isJobAd !== 'boolean') throw new Error('isJobAd must be boolean')

  // Early exit shapes: Gemini may omit isLegal/weaknesses when isJobAd or isLegal is false
  if (obj.isJobAd === false) {
    return { isJobAd: false, isLegal: true, weaknesses: {} as DiagnosisResult['weaknesses'] }
  }

  if (obj.isLegal === false) {
    return { isJobAd: true, isLegal: false, weaknesses: {} as DiagnosisResult['weaknesses'] }
  }

  // Full shape required when isJobAd:true and isLegal:true
  if (typeof obj.isLegal !== 'boolean') throw new Error('isLegal must be boolean')

  if (typeof obj.weaknesses !== 'object' || obj.weaknesses === null) {
    throw new Error('weaknesses must be an object')
  }

  const weaknesses = obj.weaknesses as Record<string, unknown>

  for (const key of WEAKNESS_KEYS) {
    if (!(key in weaknesses)) throw new Error(`Missing weakness key: ${key}`)

    const entry = weaknesses[key] as Record<string, unknown>

    if (typeof entry.flagged !== 'boolean') {
      throw new Error(`weaknesses.${key}.flagged must be boolean`)
    }

    if (entry.flagged) {
      if (typeof entry.explanation !== 'string' || entry.explanation.trim() === '') {
        throw new Error(`weaknesses.${key}.explanation must be a non-empty string when flagged`)
      }
      if (typeof entry.fix !== 'string' || entry.fix.trim() === '') {
        throw new Error(`weaknesses.${key}.fix must be a non-empty string when flagged`)
      }
    }
  }

  return raw as DiagnosisResult
}
