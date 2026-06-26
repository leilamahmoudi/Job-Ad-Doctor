'use client'

import { useState } from 'react'
import { DiagnosisResult, WEAKNESS_KEYS } from '@/lib/types'
import { DiagnosisCard } from '@/components/DiagnosisCard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface StepDiagnosisProps {
  diagnosis: DiagnosisResult
  onNext: () => void
  onBack: () => void
  onIterate: (note: string) => void
  hasIterated: boolean
  error: string | null
  iterateError: string | null
}

export function StepDiagnosis({
  diagnosis,
  onNext,
  onBack,
  onIterate,
  hasIterated,
  error,
  iterateError,
}: StepDiagnosisProps) {
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState<string | null>(null)

  const flaggedKeys = WEAKNESS_KEYS.filter((k) => diagnosis.weaknesses[k].flagged)
  const cleanKeys = WEAKNESS_KEYS.filter((k) => !diagnosis.weaknesses[k].flagged)
  const flaggedCount = flaggedKeys.length

  const handleIterate = () => {
    if (!note.trim()) {
      setNoteError('Please add some context before re-analysing.')
      return
    }
    setNoteError(null)
    onIterate(note.trim())
  }

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
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Needs work</p>
          <div className="flex flex-col gap-3">
            {flaggedKeys.map((key) => (
              <DiagnosisCard key={key} weaknessKey={key} result={diagnosis.weaknesses[key]} />
            ))}
          </div>
        </div>
      )}

      {cleanKeys.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Looking good</p>
          <div className="flex flex-col gap-3">
            {cleanKeys.map((key) => (
              <DiagnosisCard key={key} weaknessKey={key} result={diagnosis.weaknesses[key]} />
            ))}
          </div>
        </div>
      )}

      {/* Iteration section */}
      <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 bg-gray-50">
        {hasIterated ? (
          <p className="text-sm text-green-700 font-medium flex items-center gap-1.5">
            <span>✓</span> Analysis refined
          </p>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium text-gray-700">Something look off?</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Add context and we&apos;ll re-analyse once — e.g. &quot;We do list salary on the benefits page&quot; or &quot;This is for a senior audience&quot;.
              </p>
            </div>
            <Textarea
              placeholder="Add context to refine this analysis…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-sm resize-none min-h-[80px] bg-white"
            />
            {(noteError || iterateError) && (
              <p className="text-sm text-red-600">{noteError ?? iterateError}</p>
            )}
            <Button variant="outline" onClick={handleIterate} className="w-full">
              Re-analyse with this context
            </Button>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <Button onClick={onNext} className="w-full">
        Rewrite with fixes applied →
      </Button>
    </div>
  )
}
