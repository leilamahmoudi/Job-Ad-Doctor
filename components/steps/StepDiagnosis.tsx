'use client'

import { DiagnosisResult, WEAKNESS_KEYS } from '@/lib/types'
import { DiagnosisCard } from '@/components/DiagnosisCard'
import { Button } from '@/components/ui/button'

interface StepDiagnosisProps {
  diagnosis: DiagnosisResult
  onNext: () => void
  isLoading: boolean
}

export function StepDiagnosis({ diagnosis, onNext, isLoading }: StepDiagnosisProps) {
  const sorted = [...WEAKNESS_KEYS].sort((a, b) => {
    return (diagnosis.weaknesses[b].flagged ? 1 : 0) - (diagnosis.weaknesses[a].flagged ? 1 : 0)
  })

  const flaggedCount = WEAKNESS_KEYS.filter((k) => diagnosis.weaknesses[k].flagged).length

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Here&apos;s what we found</h2>
        <p className="text-sm text-gray-500 mt-1">
          {flaggedCount === 0
            ? 'Your job ad looks strong across all areas.'
            : `${flaggedCount} issue${flaggedCount > 1 ? 's' : ''} to fix.`}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.map((key) => (
          <DiagnosisCard key={key} weaknessKey={key} result={diagnosis.weaknesses[key]} />
        ))}
      </div>

      <Button onClick={onNext} disabled={isLoading} className="w-full">
        {isLoading ? 'Generating rewrite…' : 'See the rewrite →'}
      </Button>
    </div>
  )
}
