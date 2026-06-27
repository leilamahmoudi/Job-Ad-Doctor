'use client'

import { CheckCircle2 } from 'lucide-react'
import { DiagnosisResult, WEAKNESS_KEYS } from '@/lib/types'
import { DiagnosisCard } from '@/components/DiagnosisCard'

interface StepDiagnosisProps {
  diagnosis: DiagnosisResult
  onNext: () => void
  onBack: () => void
  error: string | null
}

function SectionDivider({ label, variant = 'primary' }: { label: string; variant?: 'primary' | 'emerald' }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className={`text-[10px] font-bold tracking-widest uppercase ${variant === 'emerald' ? 'text-emerald-600' : 'text-primary'}`}>
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
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
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 mb-4 cursor-pointer"
        >
          Back
        </button>

        {flaggedCount === 0 ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="size-10 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Your job ad is in great shape.</h2>
            <p className="text-sm text-muted-foreground">No major issues found. Here is a summary of what is working.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-foreground">Diagnosis complete</h2>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm font-semibold bg-accent/20 text-accent-foreground px-2 py-1 rounded-full">
                {flaggedCount} issue{flaggedCount > 1 ? 's' : ''} to fix
              </span>
              {cleanKeys.length > 0 && (
                <span className="text-sm font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                  {cleanKeys.length} looking good
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              We found {flaggedCount} thing{flaggedCount > 1 ? 's' : ''} worth fixing.
            </p>
          </div>
        )}
      </div>

      {flaggedKeys.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionDivider label="Needs work" />
          <div className="flex flex-col gap-3">
            {flaggedKeys.map((key, i) => (
              <DiagnosisCard key={key} weaknessKey={key} result={diagnosis.weaknesses[key]} index={i} />
            ))}
          </div>
        </div>
      )}

      {cleanKeys.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionDivider label="Looking good" variant="emerald" />
          <div className="flex flex-col gap-3">
            {cleanKeys.map((key, i) => (
              <DiagnosisCard key={key} weaknessKey={key} result={diagnosis.weaknesses[key]} index={flaggedKeys.length + i} />
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        onClick={onNext}
        className="btn-amber w-full py-3 rounded-xl font-semibold text-sm transition-colors duration-150"
      >
        Rewrite with fixes applied
      </button>
    </div>
  )
}
