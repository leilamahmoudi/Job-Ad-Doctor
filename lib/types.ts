export type WeaknessKey =
  | 'generic_language'
  | 'weak_employer_branding'
  | 'unclear_role'
  | 'bias_risks'
  | 'unrealistic_requirements'
  | 'missing_value_prop'
  | 'compensation_opacity'
  | 'corporate_tone'

export const WEAKNESS_KEYS: WeaknessKey[] = [
  'generic_language',
  'weak_employer_branding',
  'unclear_role',
  'bias_risks',
  'unrealistic_requirements',
  'missing_value_prop',
  'compensation_opacity',
  'corporate_tone',
]

export const WEAKNESS_LABELS: Record<WeaknessKey, string> = {
  generic_language: 'Generic language & buzzwords',
  weak_employer_branding: 'Weak employer branding',
  unclear_role: 'Unclear role & responsibilities',
  bias_risks: 'Bias risks',
  unrealistic_requirements: 'Unrealistic requirements',
  missing_value_prop: 'Missing candidate value proposition',
  compensation_opacity: 'No compensation range',
  corporate_tone: 'Overly formal / corporate tone',
}

export interface WeaknessResult {
  flagged: boolean
  explanation?: string
  fix?: string
}

export interface DiagnosisResult {
  isJobAd: boolean
  isLegal: boolean
  weaknesses: Record<WeaknessKey, WeaknessResult>
}

export type ToneOption = 'direct' | 'warm' | 'professional'

export const TONE_OPTIONS: ToneOption[] = ['direct', 'warm', 'professional']

export const TONE_LABELS: Record<ToneOption, { label: string; description: string }> = {
  direct: { label: 'Direct & confident', description: 'Clear, punchy, no fluff' },
  warm: { label: 'Warm & human', description: 'Conversational, inviting, personality-forward' },
  professional: { label: 'Professional & structured', description: 'Formal but specific' },
}

export interface AllRewrites {
  direct: string
  warm: string
  professional: string
}
