export function validateAnalyseInput(body: unknown):
  | { valid: true; jobAd: string; companyName?: string; companyDesc?: string; iterationNote?: string }
  | { valid: false; error: string; status: number } {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, error: 'Invalid request body', status: 400 }
  }

  const obj = body as Record<string, unknown>

  if (typeof obj.jobAd !== 'string') {
    return { valid: false, error: 'jobAd must be a string', status: 400 }
  }

  if (obj.jobAd.trim() === '') {
    return { valid: false, error: 'Job ad cannot be empty', status: 400 }
  }

  const wordCount = obj.jobAd.trim().split(/\s+/).length
  if (wordCount < 100) {
    return {
      valid: false,
      error: `Job ad is too short (${wordCount} words). Please paste the full posting (at least 100 words).`,
      status: 400,
    }
  }

  return {
    valid: true,
    jobAd: obj.jobAd,
    companyName: typeof obj.companyName === 'string' ? obj.companyName : undefined,
    companyDesc: typeof obj.companyDesc === 'string' ? obj.companyDesc : undefined,
    iterationNote: typeof obj.iterationNote === 'string' && obj.iterationNote.trim()
      ? obj.iterationNote.trim()
      : undefined,
  }
}
