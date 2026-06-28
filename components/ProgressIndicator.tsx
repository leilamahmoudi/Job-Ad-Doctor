'use client'

interface ProgressIndicatorProps {
  currentStep: 1 | 2 | 3
  onStepClick?: (step: 1 | 2 | 3) => void
}

const STEPS: { n: 1 | 2 | 3; label: string }[] = [
  { n: 1, label: 'Intake' },
  { n: 2, label: 'Diagnosis' },
  { n: 3, label: 'Prescription' },
]

export function ProgressIndicator({ currentStep, onStepClick }: ProgressIndicatorProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-12 bg-primary px-4 sm:px-6">
      <button
        onClick={() => onStepClick?.(1)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        aria-label="Go to start"
      >
        <span className="text-lg font-bold text-primary-foreground leading-none">&#8478;</span>
        <span className="text-sm font-semibold text-primary-foreground">Job Ad Doctor</span>
      </button>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {STEPS.map(({ n, label }, i) => {
          const isPast = n < currentStep
          const isCurrent = n === currentStep
          const isClickable = isPast && !!onStepClick

          const pill = (
            <div className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200 ${
                  isCurrent
                    ? 'bg-white text-primary'
                    : isPast
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-white/50 border border-white/20'
                }`}
              >
                {isPast ? '✓' : n}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline transition-colors duration-200 ${
                  isCurrent ? 'text-white' : isPast ? 'text-white/70' : 'text-white/40'
                }`}
              >
                {label}
              </span>
            </div>
          )

          return (
            <div key={n} className="flex items-center gap-1.5 sm:gap-2">
              {i > 0 && (
                <div className="h-px w-3 sm:w-5 bg-white/20" />
              )}
              {isClickable ? (
                <button
                  onClick={() => onStepClick(n)}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  aria-label={`Go back to ${label}`}
                >
                  {pill}
                </button>
              ) : (
                pill
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
