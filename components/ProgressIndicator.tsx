'use client'

interface ProgressIndicatorProps {
  currentStep: 1 | 2 | 3
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center h-12 bg-white border-b border-gray-100">
      <div className="flex gap-2">
        {([1, 2, 3] as const).map((step) => (
          <div
            key={step}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              step === currentStep
                ? 'bg-gray-900 scale-125'
                : step < currentStep
                  ? 'bg-gray-400'
                  : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
