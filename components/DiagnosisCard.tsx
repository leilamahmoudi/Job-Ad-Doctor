import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { WeaknessKey, WeaknessResult, WEAKNESS_LABELS, STRENGTH_LABELS } from '@/lib/types'

interface DiagnosisCardProps {
  weaknessKey: WeaknessKey
  result: WeaknessResult
  index?: number
}

export function DiagnosisCard({ weaknessKey, result, index = 0 }: DiagnosisCardProps) {
  const delay = `${index * 80}ms`

  if (result.flagged) {
    return (
      <div
        className="stagger-card border-l-4 border-primary bg-white rounded-r-xl p-4 shadow-sm"
        style={{ animationDelay: delay }}
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">{WEAKNESS_LABELS[weaknessKey]}</p>
            {result.explanation && (
              <p className="text-sm text-muted-foreground mt-1">{result.explanation}</p>
            )}
            {result.fix && (
              <p className="text-xs text-accent-foreground mt-2 bg-accent/20 rounded-md px-2 py-1">{result.fix}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="stagger-card border-l-4 border-emerald-500 bg-white rounded-r-xl p-4 shadow-sm"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-2">
        <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
        <p className="font-semibold text-emerald-800 text-sm">{STRENGTH_LABELS[weaknessKey]}</p>
      </div>
    </div>
  )
}
