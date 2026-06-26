'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

interface StepInputProps {
  jobAd: string
  companyName: string
  companyDesc: string
  onJobAdChange: (v: string) => void
  onCompanyNameChange: (v: string) => void
  onCompanyDescChange: (v: string) => void
  onSubmit: () => void
  isLoading: boolean
  error: string | null
}

export function StepInput({
  jobAd,
  companyName,
  companyDesc,
  onJobAdChange,
  onCompanyNameChange,
  onCompanyDescChange,
  onSubmit,
  isLoading,
  error,
}: StepInputProps) {
  const [contextOpen, setContextOpen] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = () => {
    if (jobAd.trim() === '') {
      setValidationError('Please paste your job ad.')
      return
    }
    const wordCount = jobAd.trim().split(/\s+/).length
    if (wordCount < 100) {
      setValidationError(
        `Your job ad is too short (${wordCount} words). Please paste the full posting.`
      )
      return
    }
    setValidationError(null)
    onSubmit()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          Your job ad, rewritten by an expert — in seconds.
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Paste it below — we&apos;ll diagnose what&apos;s weak and rewrite it in seconds.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="Paste your job ad here…"
          value={jobAd}
          onChange={(e) => onJobAdChange(e.target.value)}
          className="min-h-[160px] text-sm resize-none"
        />
        {(validationError || error) && (
          <p className="text-sm text-red-600">{validationError ?? error}</p>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setContextOpen((o) => !o)}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          {contextOpen ? '▾' : '▸'} Add company context (improves results)
        </button>
        {contextOpen && (
          <div className="mt-3 flex flex-col gap-3">
            <Input
              placeholder="Company name"
              value={companyName}
              onChange={(e) => onCompanyNameChange(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="One-line description (e.g. We build climate tech for SMEs)"
              value={companyDesc}
              onChange={(e) => onCompanyDescChange(e.target.value)}
              className="text-sm"
            />
          </div>
        )}
      </div>

      <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
        {isLoading ? 'Analysing…' : 'Analyse my job ad →'}
      </Button>
    </div>
  )
}
