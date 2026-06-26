'use client'

import { DiagnosisResult, WEAKNESS_KEYS } from '@/lib/types'
import { DiagnosisCard } from '@/components/DiagnosisCard'
import { Button } from '@/components/ui/button'

interface StepDiagnosisProps {
  diagnosis: DiagnosisResult
  onNext: () => void
  onBack: () => void
  error: string | null
}

export function StepDiagnosis({ diagnosis, onNext, onBack, error }: StepDiagnosisProps) {
  const flaggedKeys = WEAKNESS_KEYS.filter((k) => diagnosis.weaknesses[k].flagged)
  const cleanKeys = WEAKNESS_KEYS.filter((k) => !diagnosis.weaknesses[k].flagged)
  const flaggedCount = flaggedKeys.length

  return (
    <div className="flex flex-col gap-5">
      <div>
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-4"
        >
          ← Back
        </button>
        <h2 className="text-xl font-bold text-gray-900">Diagnosis complete</h2>
        <div className="mt-2 flex items-center gap-3">
          {flaggedCount === 0 ? (
            <span className="text-sm text-green-700 font-medium bg-green-50 px-2 py-1 rounded-full">
              ✓ All checks passed
            </span>
          ) : (
            <>
              <span className="text-sm text-red-700 font-medium bg-red-50 px-2 py-1 rounded-full">
                {flaggedCount} issue{flaggedCount > 1 ? 's' : ''} found
              </span>
              {cleanKeys.length > 0 && (
                <span className="text-sm text-green-700 font-medium bg-green-50 px-2 py-1 rounded-full">
                  {cleanKeys.length} looking good
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {flaggedKeys.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Needs work
          </p>
          <div className="flex flex-col gap-3">
            {flaggedKeys.map((key) => (
              <DiagnosisCard key={key} weaknessKey={key} result={diagnosis.weaknesses[key]} />
            ))}
          </div>
        </div>
      )}

      {cleanKeys.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Looking good
          </p>
          <div className="flex flex-col gap-3">
            {cleanKeys.map((key) => (
              <DiagnosisCard key={key} weaknessKey={key} result={diagnosis.weaknesses[key]} />
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <Button onClick={onNext} className="w-full">
        Rewrite with fixes applied →
      </Button>
    </div>
  )
}
