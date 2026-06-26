import { WeaknessKey, WeaknessResult, WEAKNESS_LABELS } from '@/lib/types'

interface DiagnosisCardProps {
  weaknessKey: WeaknessKey
  result: WeaknessResult
}

export function DiagnosisCard({ weaknessKey, result }: DiagnosisCardProps) {
  const label = WEAKNESS_LABELS[weaknessKey]

  if (result.flagged) {
    return (
      <div className="border-l-4 border-red-400 bg-white rounded-r-lg p-4 shadow-sm">
        <div className="flex items-start gap-2">
          <span className="text-lg leading-none mt-0.5">❌</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{label}</p>
            {result.explanation && (
              <p className="text-sm text-gray-600 mt-1">{result.explanation}</p>
            )}
            {result.fix && (
              <p className="text-sm text-blue-700 mt-2 bg-blue-50 rounded px-2 py-1">{result.fix}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-l-4 border-green-400 bg-white rounded-r-lg p-4 shadow-sm opacity-50">
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none">✅</span>
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
      </div>
    </div>
  )
}
